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

type MessageHandler = (data: any) => void;
type ConnectionHandler = (data: { connections: number }) => void;

class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  private getWebSocketUrl(): string {
    if (process.env.NODE_ENV === 'production') {
      return 'https://card-deck-simulator-server-production.up.railway.app';
    }
    return 'http://localhost:3001';
  }

  connect() {
    if (this.socket?.connected) {
      console.log('Already connected to WebSocket server');
      return;
    }

    const wsUrl = this.getWebSocketUrl();
    console.log('Connecting to WebSocket server at:', wsUrl);

    this.socket = io(wsUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.startPingInterval();
      this.socket?.emit('getConnectionCount');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.stopPingInterval();
      this.scheduleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('Connection error:', error);
      this.scheduleReconnect();
    });

    this.socket.on('stateUpdate', (state: GameState) => {
      this.notifyHandlers('stateUpdate', state);
    });

    this.socket.on('connectionUpdate', (data: { connections: number }) => {
      console.log('Received connection update:', data);
      this.notifyConnectionHandlers(data);
    });

    this.socket.on('error', (error: { message: string }) => {
      this.notifyHandlers('error', error);
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

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, new Set());
    }
    this.messageHandlers.get(event)?.add(callback);
    return () => {
      this.messageHandlers.get(event)?.delete(callback);
    };
  }

  private notifyHandlers(event: string, data: any) {
    this.messageHandlers.get(event)?.forEach(callback => {
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

  private notifyConnectionHandlers(data: { connections: number }) {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in connection handler:', error);
      }
    });
  }

  disconnect() {
    this.stopPingInterval();
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService(); 