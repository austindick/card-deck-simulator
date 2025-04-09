import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, Snackbar, Alert } from '@mui/material';
import { websocketService } from '../services/websocketService';
import { GameState } from '../types/gameState';
import UrlDisplay from './UrlDisplay';
import ConnectionStatus from './ConnectionStatus';

const Deck: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    drawnCards: [],
    discardPile: [],
    peekedCards: [],
    lastAction: { type: '' }
  });
  const [connectionCount, setConnectionCount] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeState = websocketService.subscribe('stateUpdate', (data: GameState) => {
      setGameState(data);
    });

    const unsubscribeConnections = websocketService.subscribe('connectionUpdate', (data: { connections: number }) => {
      setConnectionCount(Math.max(1, data.connections));
    });

    const unsubscribeError = websocketService.subscribe('error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      unsubscribeState();
      unsubscribeConnections();
      unsubscribeError();
    };
  }, []);

  const handleDrawCard = () => {
    websocketService.send('drawCard');
  };

  const handleShuffle = () => {
    websocketService.send('shuffle');
  };

  const handlePeek = () => {
    websocketService.send('peek');
  };

  const handleReset = () => {
    websocketService.send('reset');
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <UrlDisplay />
        </Grid>
        <Grid item xs={12}>
          <ConnectionStatus connectionCount={connectionCount} />
        </Grid>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Deck Status
            </Typography>
            <Typography variant="body1" gutterBottom>
              Cards in deck: {gameState.cards.length}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Cards drawn: {gameState.drawnCards.length}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Cards in discard: {gameState.discardPile.length}
            </Typography>
            {gameState.peekedCards.length > 0 && (
              <Typography variant="body1" gutterBottom>
                Peeked cards: {gameState.peekedCards.map(card => `${card.name}`).join(', ')}
              </Typography>
            )}
            {gameState.lastAction.type && (
              <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
                Last action: {gameState.lastAction.type}
                {gameState.lastAction.card && ` - ${gameState.lastAction.card.name}`}
              </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={handleDrawCard} disabled={gameState.cards.length === 0}>
              Draw Card
            </Button>
            <Button variant="contained" onClick={handleShuffle}>
              Shuffle
            </Button>
            <Button variant="contained" onClick={handlePeek} disabled={gameState.cards.length === 0}>
              Peek
            </Button>
            <Button variant="contained" onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Deck;