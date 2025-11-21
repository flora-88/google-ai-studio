export type Language = 'en' | 'zh-TW' | 'ja' | 'ko' | 'es' | 'fr' | 'de';

export enum House {
  Gryffindor = 'Gryffindor',
  Slytherin = 'Slytherin',
  Ravenclaw = 'Ravenclaw',
  Hufflepuff = 'Hufflepuff',
  Unsorted = 'Unsorted'
}

export enum GameState {
  START = 'START',
  SORTING = 'SORTING',
  HOUSE_REVEAL = 'HOUSE_REVEAL',
  GAMEPLAY = 'GAMEPLAY',
  CLASS_SESSION = 'CLASS_SESSION'
}

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  house: House;
  stats: {
    intelligence: number;
    courage: number;
    ambition: number;
    loyalty: number;
  };
}

export interface SortingQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface ClassTask {
  id: string;
  subject: string;
  description: string;
  completed: boolean;
  locationId: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  npcs: string[];
  connectedTo: string[];
  backgroundImage?: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
  isPlayer: boolean;
}