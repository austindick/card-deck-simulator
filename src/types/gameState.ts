import { Card } from './Card';

export interface GameState {
  cards: Card[];
  drawnCards: Card[];
  discardPile: Card[];
  peekedCards: Card[];
  lastAction: {
    type: string;
    card?: Card;
  };
} 