import React, { useState, useEffect } from 'react';
import { Card as CardType } from '../types/Card';
import { Card as MuiCard, CardContent, Typography, Box, Skeleton } from '@mui/material';

interface CardProps {
  card: CardType;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ card, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the image
    if (card.imageUrl) {
      const img = new Image();
      img.src = card.imageUrl;
      img.onload = () => setImageLoaded(true);
    }
  }, [card.imageUrl]);

  return (
    <MuiCard 
      sx={{
        width: 200, 
        height: 300, 
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        border: '8px solid white',
        '&:hover': {
          transform: onClick ? 'scale(1.05)' : 'none',
        }
      }}
      onClick={onClick}
    >
      <CardContent>
        {card.imageUrl && (
          <Box sx={{ position: 'relative', height: 120, mb: 2 }}>
            {!imageLoaded && (
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={120} 
                sx={{ borderRadius: 1 }}
              />
            )}
            <Box
              component="img"
              src={card.imageUrl}
              alt={card.name}
              sx={{
                width: '100%',
                height: 120,
                objectFit: 'cover',
                borderRadius: 1,
                display: imageLoaded ? 'block' : 'none',
                transition: 'opacity 0.3s ease-in-out',
                opacity: imageLoaded ? 1 : 0,
              }}
            />
          </Box>
        )}
        <Typography variant="h6" component="div" gutterBottom>
          {card.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {card.description}
        </Typography>
        {card.attributes && Object.entries(card.attributes).length > 0 && (
          <Box sx={{ mt: 2 }}>
            {Object.entries(card.attributes).map(([key, value]) => (
              <Typography key={key} variant="body2">
                <strong>{key}:</strong> {value}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>
    </MuiCard>
  );
}; 