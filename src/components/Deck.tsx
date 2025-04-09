import React, { useEffect, useState } from 'react';
import { socketService } from '../services/socketService';
import { GameState } from '../types/gameState';

export const Deck: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connectionCount, setConnectionCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to state updates
    const unsubscribeState = socketService.subscribe('stateUpdate', (state: GameState) => {
      console.log('Received state update:', state);
      setGameState(state);
    });

    // Subscribe to connection updates
    const unsubscribeConnections = socketService.subscribe('connectionUpdate', (data: { connections: number }) => {
      console.log('Received connection update:', data);
      setConnectionCount(Math.max(1, data.connections));
    });

    // Subscribe to errors
    const unsubscribeErrors = socketService.subscribe('error', (error: { message: string }) => {
      console.error('Received error:', error);
      setError(error.message);
    });

    // Connect to Socket.io server
    socketService.connect();

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeState();
      unsubscribeConnections();
      unsubscribeErrors();
      socketService.disconnect();
    };
  }, []);

  const handleDrawCard = () => {
    socketService.send('draw');
  };

  const handleShuffle = () => {
    socketService.send('shuffle');
  };

  const handlePeek = () => {
    socketService.send('peek');
  };

  const handleReset = () => {
    socketService.send('reset');
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!gameState) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="deck">
      <div className="connection-count">
        Active Connections: {connectionCount}
      </div>
      <div className="deck-info">
        <p>Cards in deck: {gameState.cards.length}</p>
        <p>Drawn cards: {gameState.drawnCards.length}</p>
        <p>Discard pile: {gameState.discardPile.length}</p>
        {gameState.peekedCards.length > 0 && (
          <p>Peeked cards: {gameState.peekedCards.length}</p>
        )}
      </div>
      <div className="actions">
        <button onClick={handleDrawCard} disabled={gameState.cards.length === 0}>
          Draw Card
        </button>
        <button onClick={handleShuffle} disabled={gameState.cards.length === 0}>
          Shuffle
        </button>
        <button onClick={handlePeek} disabled={gameState.cards.length === 0}>
          Peek
        </button>
        <button onClick={handleReset}>Reset</button>
      </div>
      {gameState.lastAction && (
        <div className="last-action">
          Last action: {gameState.lastAction.type}
          {gameState.lastAction.card && (
            <span> - {gameState.lastAction.card.name}</span>
          )}
        </div>
      )}
      {gameState.cards.map((card) => (
        <div className="card">
          <h3>{card.name}</h3>
          <p>{card.description}</p>
          <img src={card.imageUrl} alt={card.name} />
          {Object.entries(card.attributes).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {value}</p>
          ))}
        </div>
      ))}
    </div>
  );
};