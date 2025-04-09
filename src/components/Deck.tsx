import React, { useState, useEffect, useMemo } from 'react';
import { Box, Button, Typography, Paper, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Card as CardType } from '../types/Card';
import { Card } from './Card';
import { SheetsService } from '../services/sheetsService';
import { websocketService } from '../services/websocketService';
import DeleteIcon from '@mui/icons-material/Delete';
import { GameState } from '../types/gameState';

export const Deck: React.FC = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [drawnCards, setDrawnCards] = useState<CardType[]>([]);
  const [discardPile, setDiscardPile] = useState<CardType[]>([]);
  const [peekedCards, setPeekedCards] = useState<CardType[]>([]);
  const [peekCount, setPeekCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);

  const sheetsService = useMemo(() => new SheetsService({
    spreadsheetId: '1Q3Rw-CZLZG8Ylzx9JyPyh7DCP0URnzEn7pvoPISPklU',
    apiKey: 'AIzaSyDslajEzvHiBMdHqs8MXLzwU0lBuVlqBZo',
    range: 'Sheet1!A1:Z'
  }), []);

  useEffect(() => {
    const loadCards = async () => {
      try {
        const fetchedCards = await sheetsService.fetchCards();
        setCards(fetchedCards);
        websocketService.sendMessage('reset', { cards: fetchedCards });
      } catch (error) {
        console.error('Error loading cards:', error);
        setError('Failed to load cards. Please check the console for details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [sheetsService]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribeToMessages((state: GameState) => {
      setCards(state.cards);
      setDrawnCards(state.drawnCards);
      setDiscardPile(state.discardPile);
      setPeekedCards(state.peekedCards);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Preload images for peeked cards
  useEffect(() => {
    peekedCards.forEach(card => {
      if (card.imageUrl) {
        const img = new Image();
        img.src = card.imageUrl;
      }
    });
  }, [peekedCards]);

  const drawCard = () => {
    if (cards.length === 0) {
      if (discardPile.length > 0) {
        // Shuffle discard pile and add to deck
        const shuffledDiscard = [...discardPile].sort(() => Math.random() - 0.5);
        setCards(shuffledDiscard);
        setDiscardPile([]);
        websocketService.sendMessage('reset', { cards: shuffledDiscard });
      }
      return;
    }
    
    websocketService.sendMessage('draw');
  };

  const discardCards = () => {
    if (drawnCards.length === 0) return;
    websocketService.sendMessage('discard');
  };

  const resetDeck = () => {
    const allCards = [...cards, ...drawnCards, ...discardPile, ...peekedCards];
    const shuffledCards = allCards.sort(() => Math.random() - 0.5);
    websocketService.sendMessage('reset', { cards: shuffledCards });
  };

  const peekCards = () => {
    if (cards.length > 0) {
      websocketService.sendMessage('peek', { count: peekCount });
    }
  };

  const handleClosePeekedCards = () => {
    websocketService.sendMessage('returnPeeked');
  };

  const removePeekedCard = (index: number) => {
    const cardToDiscard = peekedCards[index];
    setPeekedCards(prev => prev.filter((_, i) => i !== index));
    setDiscardPile(prev => [...prev, cardToDiscard]);
  };

  const handleDragStart = (index: number) => {
    setDraggedCard(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedCard === null || draggedCard === index) return;
    
    // Update the dragged card's position
    const newPeekedCards = [...peekedCards];
    const draggedCardContent = newPeekedCards[draggedCard];
    newPeekedCards.splice(draggedCard, 1);
    newPeekedCards.splice(index, 0, draggedCardContent);
    setPeekedCards(newPeekedCards);
    setDraggedCard(index);
    
    // Send the reordered peeked cards to the server
    websocketService.sendMessage('updatePeekedCards', { peekedCards: newPeekedCards });
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  if (isLoading) {
    return <Typography>Loading cards...</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body2">
          Please make sure:
          1. The Google Sheet exists and is accessible
          2. The sheet has the correct column headers (name, description, imageUrl)
          3. There is data in the rows below the headers
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#F9F9F9', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Card Deck Simulator</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '350px 1fr 350px', gap: 3 }}>
        {/* Deck Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper 
            sx={{ 
              p: 2, 
              backgroundColor: 'transparent', 
              minHeight: '400px',
              minWidth: '250px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'default',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
          >
            <Box sx={{ position: 'relative', width: '200px', height: '300px' }}>
              {Array.from({ length: Math.min(cards.length, 5) }).map((_, index) => (
                <Box
                  key={`deck-${index}`}
                  sx={{
                    position: 'absolute',
                    top: `${index * 2}px`,
                    left: `${index * 2}px`,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'primary.main',
                    borderRadius: 2,
                    border: '8px solid white',
                    zIndex: 5 - index,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                />
              ))}
              {cards.length === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary',
                  }}
                >
                  <Typography>Empty</Typography>
                </Box>
              )}
            </Box>
          </Paper>
          <Button 
            variant="contained" 
            onClick={drawCard}
            disabled={cards.length === 0 && discardPile.length === 0}
            fullWidth
          >
            Draw Card
          </Button>
        </Box>

        {/* Revealed Cards Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: '#F0F0F0', 
            minHeight: '400px', 
            minWidth: '250px',
            display: 'flex', 
            flexDirection: 'column',
            boxShadow: 'none',
          }}>
            <Typography variant="h6" gutterBottom>
              Revealed Cards
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: 2,
              flex: 1,
              overflowY: 'auto',
              pb: 2,
            }}>
              {drawnCards.map((card) => (
                <Box key={card.id}>
                  <Card card={card} />
                </Box>
              ))}
            </Box>
          </Paper>
          <Button 
            variant="contained" 
            color="secondary"
            onClick={discardCards}
            disabled={drawnCards.length === 0}
            fullWidth
          >
            Discard Cards
          </Button>
        </Box>

        {/* Discard Pile Area */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper sx={{ 
            p: 2, 
            backgroundColor: 'transparent', 
            minHeight: '400px', 
            minWidth: '250px',
            display: 'flex', 
            flexDirection: 'column',
            border: '2px dashed',
            borderColor: 'grey.300',
            boxShadow: 'none',
          }}>
            <Typography variant="h6" gutterBottom>
              Discard Pile
            </Typography>
            <Box sx={{ 
              position: 'relative', 
              width: 200, 
              height: 300, 
              margin: '0 auto',
              flex: 1,
              mb: 2,
            }}>
              {discardPile.map((card, index) => (
                <Box
                  key={card.id}
                  sx={{
                    position: 'absolute',
                    top: `${index * 2}px`,
                    left: `${index * 2}px`,
                    width: '100%',
                    height: '100%',
                    zIndex: discardPile.length - index,
                  }}
                >
                  <Card card={card} />
                </Box>
              ))}
              {discardPile.length === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'text.secondary',
                  }}
                >
                  <Typography>Empty</Typography>
                </Box>
              )}
            </Box>
          </Paper>
          <Button 
            variant="outlined" 
            onClick={resetDeck}
            disabled={cards.length === 0 && drawnCards.length === 0 && discardPile.length === 0}
            fullWidth
          >
            Reset Deck
          </Button>
        </Box>
      </Box>

      {/* Peek Controls */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="number"
          label="Number of cards to peek"
          value={peekCount}
          onChange={(e) => setPeekCount(Math.max(1, parseInt(e.target.value) || 1))}
          inputProps={{ min: 1, max: cards.length }}
          sx={{ width: 200 }}
        />
        <Button
          variant="contained"
          onClick={peekCards}
          disabled={cards.length === 0}
        >
          Peek at Cards
        </Button>
      </Box>

      {/* Peeked Cards Dialog */}
      {peekedCards.length > 0 && (
        <Dialog
          open={true}
          onClose={handleClosePeekedCards}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              minHeight: '60vh',
              maxHeight: '70vh',
              minWidth: '800px',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Peeked Cards</Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              overflowX: 'auto', 
              pb: 2,
              minHeight: '380px',
              alignItems: 'center',
              justifyContent: 'center',
              pt: 2,
              backgroundColor: 'grey.100',
              borderRadius: 1,
              p: 3,
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'grey.200',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'grey.400',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'grey.500',
                },
              },
            }}>
              {peekedCards.map((card, index) => (
                <Box
                  key={`peeked-${card.id}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  sx={{
                    position: 'relative',
                    transform: draggedCard === index ? 'scale(1.05)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'grab',
                    '&:active': {
                      cursor: 'grabbing',
                    },
                    '&:hover': {
                      transform: draggedCard === null ? 'translateY(-4px)' : 'none',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      cursor: 'grab',
                      zIndex: 1,
                    },
                    '&:active::before': {
                      cursor: 'grabbing',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -30,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'primary.main',
                      color: 'white',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      zIndex: 10,
                      boxShadow: 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {index === 0 ? 'Top of Deck' : `Card ${index + 1}`}
                  </Box>
                  <Card card={card} />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      },
                      zIndex: 2,
                    }}
                    onClick={() => removePeekedCard(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePeekedCards} variant="contained" fullWidth>
              Return to Deck
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};