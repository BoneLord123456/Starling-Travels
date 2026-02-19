
export type DestinationStatus = 'Recommended' | 'Caution Advised' | 'Risky' | 'Not Recommended';

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  status: DestinationStatus;
  metrics: {
    airQualityAQI: number;
    waterPPM: number;
    soilPPM: number;
    noiseDB: number;
    crowdDensity: number;
    infraLoad: number;
    temperature: number;
    ecoStress: number;
  };
  localSignals: string[]; 
  communityFeedback: CommunityComment[];
  tags: string[];
  description: string;
  baseCostPerDay: number;
  isRiskDropping?: boolean;
  coordinates?: { lat: number; lng: number }; // Added for maps
}

export type ComfortLevel = 'Standard' | 'Premium' | 'Eco-Luxury';
export type TripStatus = 'Upcoming' | 'In Transit' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  guideId: string;
  destinationId: string;
  date: string;
  time?: string;
  travelers: number;
  pickupLocation: string;
  pickupCoords?: { lat: number; lng: number };
  duration: number; // days
  comfortLevel: ComfortLevel;
  minPrice: number;
  contribution: number;
  status: TripStatus;
  carbonFootprint: number;
  ecoPointsEarned: number;
  distanceKm?: number;
  refundAmount?: number;
  offsetCarbon?: boolean;
}

export interface CommunityComment {
  id: string;
  user: string;
  comment: string;
  date: string;
  rating: number;
}

export interface TourGuide {
  id: string;
  name: string;
  avatar: string;
  languages: string[];
  expertise: string[];
  rating: number;
  reviewCount: number;
  pricePerDay: number;
  isSustainabilityCertified: boolean;
  isPremiumOnly?: boolean;
  bio: string;
}

export interface User {
  name: string;
  email: string;
  passwordHash?: string;
  isPremium: boolean;
  joinedDate: string;
  ecoPoints: number;
  loyaltyTier: 'Green Explorer' | 'Earth Guardian' | 'Planet Partner';
}

export interface TravelRoute {
  id: string;
  type: 'rail' | 'air' | 'road' | 'mixed';
  time: string;
  ecoScore: number;
  crowdLevel: number;
  comfort: number;
  safety: number;
  price: number;
}
