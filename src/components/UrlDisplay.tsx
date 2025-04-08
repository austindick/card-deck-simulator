import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const UrlDisplay: React.FC = () => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const ngrokUrl = 'https://3cfa-2607-fea8-1ea9-f400-7434-925b-6504-b0e2.ngrok-free.app';

  const handleCopyClick = () => {
    navigator.clipboard.writeText(ngrokUrl);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
      <Typography variant="body1" sx={{ flexGrow: 1 }}>
        Share URL: {ngrokUrl}
      </Typography>
      <Button
        variant="contained"
        startIcon={<ContentCopyIcon />}
        onClick={handleCopyClick}
        size="small"
      >
        Copy
      </Button>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="URL copied to clipboard!"
      />
    </Box>
  );
};

export default UrlDisplay; 