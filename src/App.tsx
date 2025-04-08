import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Deck } from './components/Deck';
import UrlDisplay from './components/UrlDisplay';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Card Deck Simulator
        </Typography>
        <UrlDisplay />
        <ConnectionStatus />
        <Deck />
      </Box>
    </Container>
  );
}

export default App;
