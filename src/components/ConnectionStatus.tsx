import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { Person } from '@mui/icons-material';
import { useWebSocket } from '../services/websocket';

const ConnectionStatus: React.FC = () => {
  const [activeConnections, setActiveConnections] = useState<number>(0);
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket) return;

    const handleConnectionUpdate = (data: { connections: number }) => {
      setActiveConnections(data.connections);
    };

    // Listen for connection updates
    socket.on('connectionUpdate', handleConnectionUpdate);

    // Request initial connection count
    socket.emit('getConnectionCount');

    // Cleanup function
    return () => {
      socket.off('connectionUpdate', handleConnectionUpdate);
    };
  }, [socket]);

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2, 
      p: 2, 
      bgcolor: 'background.paper',
      borderRadius: 1,
      boxShadow: 1,
      mb: 2
    }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography variant="body1">
          Active Connections:
        </Typography>
        <Chip
          icon={<Person />}
          label={`${activeConnections} ${activeConnections === 1 ? 'user' : 'users'}`}
          color={activeConnections > 1 ? "success" : "default"}
          variant="outlined"
        />
      </Stack>
    </Box>
  );
};

export default ConnectionStatus; 