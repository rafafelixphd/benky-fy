export interface CharacterGridProps {
  characters: {
    char: string;
    romaji: string;
    type?: 'hiragana' | 'katakana';
    notes?: string;
  }[];
  onCharacterClick?: (char: string) => void;
  selectedChar?: string;
  showRomaji?: boolean;
  showNotes?: boolean;
  columns?: number;
  className?: string;
}

export interface FuriganaProps {
  text: string;
  reading?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showReading?: boolean;
  position?: 'top' | 'bottom';
  style?: 'modern' | 'traditional';
  hoverToShow?: boolean;
}

export interface CharacterDisplayProps {
  character: string;
  reading?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showReading?: boolean;
  className?: string;
}