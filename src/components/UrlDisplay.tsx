import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, IconButton, Snackbar } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const UrlDisplay: React.FC = () => {
  const [url, setUrl] = useState('');
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setShowCopied(true);
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
          {url}
        </Typography>
        <IconButton onClick={handleCopy} color="primary">
          <ContentCopyIcon />
        </IconButton>
      </Box>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message="URL copied to clipboard!"
      />
    </Paper>
  );
};

export default UrlDisplay; 