import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

interface ConnectionStatusProps {
  connectionCount: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ connectionCount }) => {
  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PeopleIcon color="primary" />
        <Typography variant="body1">
          {connectionCount} {connectionCount === 1 ? 'user' : 'users'} connected
        </Typography>
      </Box>
    </Paper>
  );
};

export default ConnectionStatus; 