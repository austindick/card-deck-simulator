import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Create a singleton socket instance
let socketInstance: Socket | null = null;

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // If we already have a socket instance, use it
    if (socketInstance) {
      socketRef.current = socketInstance;
      setIsConnected(socketInstance.connected);
      return;
    }

    // Create a new socket instance
    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
      forceNew: false
    });

    // Store the socket instance
    socketInstance = socket;
    socketRef.current = socket;

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    // Cleanup function
    return () => {
      // We don't disconnect the socket here to maintain the singleton
      // Only remove event listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  // Function to manually disconnect (call this when the app is shutting down)
  const disconnect = () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  return { 
    socket: socketRef.current,
    isConnected,
    disconnect
  };
}; 