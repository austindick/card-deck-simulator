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
type ConnectionHandler = (count: number) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  connect() {
    if (this.socket?.connected) return;

    console.log('Connecting to Socket.IO server at:', SOCKET_URL);
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      this.startPingInterval();
      this.socket?.emit('requestConnectionCount');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      this.stopPingInterval();
      this.scheduleReconnect();
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });

    this.socket.on('stateUpdate', (data: GameState) => {
      this.messageHandlers.forEach(handler => handler(data));
    });

    this.socket.on('connectionUpdate', (data: { connections: number }) => {
      console.log('Connection update:', data);
      this.connectionHandlers.forEach(handler => handler(Math.max(1, data.connections)));
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopPingInterval();
    this.socket?.disconnect();
    this.socket = null;
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
      this.reconnectTimeout = null;
    }, 5000);
  }

  private startPingInterval() {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      this.socket?.emit('ping');
    }, 15000);
  }

  private stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  subscribeToMessages(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  subscribeToConnections(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler);
    this.socket?.emit('requestConnectionCount');
    return () => this.connectionHandlers.delete(handler);
  }

  sendMessage(type: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, attempting to connect...');
      this.connect();
      return;
    }
    this.socket.emit('message', { type, data });
  }
}

export const websocketService = new WebSocketService(); 