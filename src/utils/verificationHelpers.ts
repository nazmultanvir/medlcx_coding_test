// Types for our CAPTCHA system
export type ShapeType = "triangle" | "square" | "circle";
export type ColorTint = "red" | "green" | "blue";

export interface VerificationChallenge {
  id: string;
  type: 'shape_detection' | 'text_recognition' | 'object_identification';
  instruction: string;
  targetObjects?: string[];
  images?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserResponse {
  challengeId: string;
  selectedItems?: number[];
  textInput?: string;
  timestamp: number;
}

export interface GridSector {
  id: number;
  hasShape: boolean;
  shape: ShapeType;
  tint?: ColorTint;
  rotation?: number;
  jitter?: { x: number; y: number };
}

// Generate traditional CAPTCHA challenges
export const createTraditionalChallenge = (): VerificationChallenge => {
  const challengeOptions: VerificationChallenge[] = [
    {
      id: 'traffic-lights',
      type: 'object_identification',
      instruction: 'Select all squares with traffic lights',
      targetObjects: ['traffic_light'],
      difficulty: 'easy'
    },
    {
      id: 'vehicles', 
      type: 'object_identification',
      instruction: 'Select all squares with cars',
      targetObjects: ['car'],
      difficulty: 'medium'
    },
    {
      id: 'crosswalks',
      type: 'object_identification',
      instruction: 'Click on all crosswalks in this image',
      targetObjects: ['crosswalk'],
      difficulty: 'hard'
    }
  ];
  
  return challengeOptions[Math.floor(Math.random() * challengeOptions.length)];
};

// Simple validation for CAPTCHA responses
export const validateResponse = (
  _challenge: VerificationChallenge,
  response: UserResponse
): boolean => {
  // Basic check - real implementation would verify against actual answers
  return response.selectedItems !== undefined && response.selectedItems.length > 0;
};

// Calculate a basic score based on response time and correctness
export const calculateScore = (
  timeMs: number,
  correct: boolean
): number => {
  if (!correct) return 0;
  
  const base = 100;
  const timeBonus = Math.max(0, 40 - (timeMs / 1000)); // Slight time bonus for speed
  return Math.round(base + timeBonus);
};

// Generate session ID for tracking
export const generateSessionId = (): string => {
  const now = Date.now();
  const rand = Math.random().toString(36).substring(2, 8);
  return `sess_${now}_${rand}`;
};

// Create a grid of shapes for our custom CAPTCHA
export const createShapeGrid = (targetShape: ShapeType, targetTint: ColorTint): GridSector[] => {
  const shapes: ShapeType[] = ["triangle", "square", "circle"];
  const tints: ColorTint[] = ["red", "green", "blue"];
  const grid: GridSector[] = [];
  
  // We want 2-4 matching shapes for a good challenge
  const targetCount = Math.floor(Math.random() * 3) + 2;
  let placedTargets = 0;
  
  for (let i = 0; i < 16; i++) {
    const needsTarget = placedTargets < targetCount && Math.random() < 0.35;
    const shouldHaveShape = needsTarget || Math.random() < 0.65;
    
    if (shouldHaveShape) {
      let shapeType: ShapeType;
      let shapeTint: ColorTint;
      
      if (needsTarget) {
        shapeType = targetShape;
        shapeTint = targetTint;
        placedTargets++;
      } else {
        // Add some decoy shapes
        shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        shapeTint = tints[Math.floor(Math.random() * tints.length)];
        
        // Make sure we don't accidentally create a target match
        if (shapeType === targetShape && shapeTint === targetTint) {
          shapeTint = tints.find((t: ColorTint) => t !== targetTint) || "red";
        }
      }
      
      grid.push({
        id: i,
        hasShape: true,
        shape: shapeType,
        tint: shapeTint,
        rotation: Math.random() * 360,
        jitter: {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        }
      });
    } else {
      grid.push({
        id: i,
        hasShape: false,
        shape: "triangle", // just a placeholder
      });
    }
  }
  
  return grid;
};

// Check if user selections match the target
export const checkShapeSelection = (
  sectors: GridSector[],
  selected: number[],
  targetShape: ShapeType,
  targetTint: ColorTint
): boolean => {
  const correctIds = sectors
    .filter(sector => 
      sector.hasShape && 
      sector.shape === targetShape && 
      sector.tint === targetTint
    )
    .map(sector => sector.id);
  
  return (
    correctIds.length === selected.length &&
    correctIds.every(id => selected.includes(id)) &&
    selected.every(id => correctIds.includes(id))
  );
};

// Add some visual clutter to confuse bots
export const generateVisualNoise = (amount: number = 8): Array<{ x: number; y: number }> => {
  return Array.from({ length: amount }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100
  }));
};

// Helper for responsive positioning
export const getResponsivePos = (
  pos: { x: number; y: number },
  videoW: number = 640,
  videoH: number = 480
): { leftPct: number; topPct: number } => {
  return {
    leftPct: (pos.x / videoW) * 100,
    topPct: (pos.y / videoH) * 100
  };
};
