import { io, Socket } from 'socket.io-client';
import { Card } from '../types/Card';

type GameState = {
  cards: Card[];
  drawnCards: Card[];
  discardPile: Card[];
  peekedCards: Card[];
  lastAction: {
    type: 'draw' | 'discard' | 'peek' | 'returnPeeked' | 'reset';
    card?: Card;
  } | null;
};

type MessageHandler = (state: GameState) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    // Determine the WebSocket server URL based on the environment
    let socketUrl;
    
    if (process.env.NODE_ENV === 'development') {
      // In development, connect to localhost
      socketUrl = 'http://localhost:3001';
    } else {
      // In production, connect to the Railway server
      socketUrl = 'https://card-deck-simulator-server-production.up.railway.app';
    }
    
    console.log('Connecting to Socket.IO server at:', socketUrl);
    
    this.socket = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true // Force a new connection each time
    });

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('state', (state: GameState) => {
      this.messageHandlers.forEach(handler => handler(state));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
      this.attemptReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        this.connect();
      }, delay);
    }
  }

  public subscribe(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  public sendMessage(type: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit('message', { type, ...data });
    } else {
      console.warn('Socket.IO is not connected');
    }
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService(); 