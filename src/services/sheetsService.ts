import { Card, GoogleSheetsConfig } from '../types/Card';

export class SheetsService {
  private config: GoogleSheetsConfig;
  private imageCache: Map<string, string> = new Map();

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  private getRandomImageUrl(cardId: string): string {
    // Check if we already have an image URL for this card
    if (this.imageCache.has(cardId)) {
      return this.imageCache.get(cardId)!;
    }

    // Generate a random image URL using Picsum Photos
    // Using a hash of the cardId to get a consistent but random image
    const hash = cardId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const imageId = Math.abs(hash % 1000) + 1; // Picsum has images from 1 to 1000
    const width = 400;
    const height = 300;
    const imageUrl = `https://picsum.photos/id/${imageId}/${width}/${height}`;
    
    // Cache the URL
    this.imageCache.set(cardId, imageUrl);
    return imageUrl;
  }

  async fetchCards(): Promise<Card[]> {
    try {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.config.spreadsheetId}/values/${this.config.range}?key=${this.config.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }

      const data = await response.json();
      const rows = data.values as string[][];

      if (!rows || rows.length === 0) {
        return [];
      }

      // Assuming first row contains headers
      const headers = rows[0];
      
      // Create cards with random images
      const cards = rows.slice(1).map((row: string[], index: number) => {
        const cardId = `card-${index + 1}`;
        const imageUrl = this.getRandomImageUrl(cardId);
        
        const card: Card = {
          id: cardId,
          name: row[headers.indexOf('name')] || '',
          description: row[headers.indexOf('description')] || '',
          imageUrl,
          attributes: {},
        };

        // Add any additional attributes from the sheet
        headers.forEach((header: string, i: number) => {
          if (!['name', 'description', 'imageUrl'].includes(header)) {
            card.attributes![header] = row[i] || '';
          }
        });

        return card;
      });

      return cards;
    } catch (error) {
      console.error('Error fetching cards from Google Sheets:', error);
      throw error;
    }
  }
} 