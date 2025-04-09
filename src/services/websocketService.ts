// TypeScript type imports
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/gameState';

// Use environment variable for WebSocket URL in production
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://card-deck-simulator-server-production.up.railway.app'
  : 'http://localhost:3001';

console.log('Environment:', process.env.NODE_ENV);
console.log('WebSocket URL:', SOCKET_URL);
console.log('REACT_APP_WEBSOCKET_URL:', process.env.REACT_APP_WEBSOCKET_URL);

class WebSocketService {
  private socket: Socket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupSocket();
  }

  private setupSocket() {
    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:3001';
    console.log('Connecting to WebSocket server at:', wsUrl);

    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
      autoConnect: true,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.reconnectAttempts = 0;
      this.startPingInterval();
      this.startConnectionCheck();
      this.requestConnectionCount();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket server:', reason);
      this.cleanup();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.cleanup();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    this.socket.on('stateUpdate', (state: GameState) => {
      this.notifySubscribers('stateUpdate', state);
    });

    this.socket.on('connectionUpdate', (data: { connections: number }) => {
      this.notifySubscribers('connectionUpdate', data);
    });

    this.socket.on('pong', () => {
      console.log('Received pong from server');
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Server error:', error);
      this.notifySubscribers('error', error);
    });
  }

  private startPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 15000);
  }

  private startConnectionCheck() {
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }
    this.connectionCheckInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.requestConnectionCount();
      }
    }, 5000);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
      this.connectionCheckInterval = null;
    }
  }

  public connect() {
    if (!this.socket?.connected) {
      this.setupSocket();
    }
  }

  public disconnect() {
    this.cleanup();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)?.add(callback);
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  private notifySubscribers(event: string, data: any) {
    this.subscribers.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  public send(type: string, payload?: any) {
    if (!this.socket?.connected) {
      console.error('Not connected to WebSocket server');
      return;
    }

    try {
      this.socket.emit('message', { type, payload });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  public requestConnectionCount() {
    if (this.socket?.connected) {
      this.socket.emit('requestConnectionCount');
    }
  }
}

export const websocketService = new WebSocketService(); 