export interface Card {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: Record<string, string>;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  apiKey: string;
  range: string;
} 