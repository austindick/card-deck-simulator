import React, { useState, useEffect } from 'react';
import { Container, Typography, Box } from '@mui/material';
import Deck from './components/Deck';
import UrlDisplay from './components/UrlDisplay';
import ConnectionStatus from './components/ConnectionStatus';
import { websocketService } from './services/websocketService';

function App() {
  const [connectionCount, setConnectionCount] = useState(1);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe('connectionUpdate', (data: { connections: number }) => {
      setConnectionCount(Math.max(1, data.connections));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Card Deck Simulator
        </Typography>
        <Box sx={{ mb: 4 }}>
          <UrlDisplay />
        </Box>
        <Box sx={{ mb: 4 }}>
          <ConnectionStatus connectionCount={connectionCount} />
        </Box>
        <Deck />
      </Box>
    </Container>
  );
}

export default App;
