
export type DestinationStatus = 'Recommended' | 'Caution Advised' | 'Risky' | 'Not Recommended';

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  status: DestinationStatus;
  metrics: {
    airQualityAQI: number; // AQI (0-500+)
    waterPPM: number; // Parts Per Million contaminants
    soilPPM: number; // Soil contamination in PPM
    noiseDB: number; // Decibels (dB)
    crowdDensity: number; // People per m²
    infraLoad: number; // % (realistic infrastructure utilization)
  };
  localSignals: string[]; 
  communityFeedback: CommunityComment[];
  tags: string[];
  description: string;
  baseCostPerDay: number;
  isRiskDropping?: boolean; // Premium alert feature
}

export interface TravelRoute {
  id: string;
  type: 'road' | 'rail' | 'air' | 'mixed';
  time: string;
  ecoScore: number; // Higher is better (efficiency)
  crowdLevel: number; // Higher is worse
  comfort: number;
  safety: number;
  price: number;
}

export interface ExperiencePreview {
  foodImg: string;
  accommodationImg: string;
  livingConditionsImg: string;
  description: string;
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

export interface Booking {
  id: string;
  guideId: string;
  destinationId: string;
  date: string;
  status: 'pending' | 'paid' | 'completed';
}

export interface UserProfile {
  name: string;
  email: string;
  theme: 'light' | 'dark' | 'system';
  isPremium: boolean;
  bookings: Booking[];
  badges: string[];
  ecoImpactRating: number;
  waterBottlesEarned: number;
}
