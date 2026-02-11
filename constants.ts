
import { Destination, TourGuide, TravelRoute } from './types';

export const MOCK_GUIDES: Record<string, TourGuide[]> = {
  'venice-italy': [
    {
      id: 'g1',
      name: 'Alessandro V.',
      avatar: 'https://i.pravatar.cc/150?u=g1',
      languages: ['Italian', 'English'],
      expertise: ['History', 'Secret Canals'],
      rating: 4.9,
      reviewCount: 124,
      pricePerDay: 120,
      isSustainabilityCertified: true,
      bio: "Local historian dedicated to showing the real Venice."
    },
    {
      id: 'gp1',
      name: 'Isabella R.',
      avatar: 'https://i.pravatar.cc/150?u=gp1',
      languages: ['Italian', 'English', 'German'],
      expertise: ['Sustainable Architecture', 'Luxury Art'],
      rating: 5.0,
      reviewCount: 45,
      pricePerDay: 250,
      isSustainabilityCertified: true,
      isPremiumOnly: true,
      bio: "Exclusive high-access tours for discerning travelers."
    }
  ],
  'kyoto-japan': [
    {
      id: 'g3',
      name: 'Kenji S.',
      avatar: 'https://i.pravatar.cc/150?u=g3',
      languages: ['Japanese', 'English'],
      expertise: ['Zen Gardens', 'Temples'],
      rating: 5.0,
      reviewCount: 210,
      pricePerDay: 150,
      isSustainabilityCertified: true,
      bio: "Spiritual guide focusing on mindful tourism."
    }
  ],
  'lofoten-norway': [
    {
      id: 'g4',
      name: 'Ingrid L.',
      avatar: 'https://i.pravatar.cc/150?u=g4',
      languages: ['Norwegian', 'English'],
      expertise: ['Arctic Trekking', 'Fjord Navigation'],
      rating: 5.0,
      reviewCount: 142,
      pricePerDay: 180,
      isSustainabilityCertified: true,
      bio: "Expert on Arctic preservation and local fishing traditions."
    }
  ],
  'azores-portugal': [
    {
      id: 'g5',
      name: 'Manuel S.',
      avatar: 'https://i.pravatar.cc/150?u=g5',
      languages: ['Portuguese', 'English'],
      expertise: ['Ocean Science', 'Hiking'],
      rating: 4.8,
      reviewCount: 67,
      pricePerDay: 90,
      isSustainabilityCertified: true,
      bio: "Passionate about marine conservation."
    }
  ],
  'faroe-islands': [
    {
      id: 'g6',
      name: 'Erik H.',
      avatar: 'https://i.pravatar.cc/150?u=g6',
      languages: ['Faroese', 'English', 'Danish'],
      expertise: ['Bird Watching', 'Photography'],
      rating: 4.9,
      reviewCount: 28,
      pricePerDay: 180,
      isSustainabilityCertified: true,
      bio: "Capturing the wild beauty of the Faroes."
    }
  ],
  'santorini-greece': [
    {
      id: 'g7',
      name: 'Eleni K.',
      avatar: 'https://i.pravatar.cc/150?u=g7',
      languages: ['Greek', 'English'],
      expertise: ['Geology', 'Wine'],
      rating: 4.7,
      reviewCount: 156,
      pricePerDay: 110,
      isSustainabilityCertified: false,
      bio: "Exploring the volcanic history of the caldera."
    }
  ]
};

export const MOCK_DESTINATIONS: Destination[] = [
  {
    id: 'lofoten-norway',
    name: 'Lofoten Islands',
    country: 'Norway',
    image: 'https://images.unsplash.com/photo-1513519107127-1bed33748e4c?auto=format&fit=crop&w=1200&q=80',
    status: 'Recommended',
    metrics: { 
      airQualityAQI: 12, // Good
      waterPPM: 35, // Excellent
      soilPPM: 10, // Virgin soil
      noiseDB: 32, // Library quiet
      crowdDensity: 0.1, // Sparse
      infraLoad: 15 
    },
    localSignals: ["Limited parking at Reinebringen - use local shuttles", "Northern lights peak activity forecasted"],
    communityFeedback: [{ id: '5', user: 'ArcticExplorer', comment: 'Breathtaking fjords and very clean.', date: '2 weeks ago', rating: 5 }],
    tags: ['Nature', 'Arctic', 'Sustainable'],
    description: 'Dramatic mountains, open sea, and sheltered bays in the Arctic Circle.',
    baseCostPerDay: 190
  },
  {
    id: 'azores-portugal',
    name: 'Azores',
    country: 'Portugal',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
    status: 'Recommended',
    metrics: { 
      airQualityAQI: 18, 
      waterPPM: 42, 
      soilPPM: 25, 
      noiseDB: 38, 
      crowdDensity: 0.2, 
      infraLoad: 22 
    },
    localSignals: ["Whale migration season - extra boat regulations in effect"],
    communityFeedback: [{ id: '4', user: 'GreenSoul', comment: 'Pure paradise.', date: '1 week ago', rating: 5 }],
    tags: ['Volcanic', 'Sustainable', 'Whales'],
    description: 'One of the world’s most sustainable tourism destinations.',
    baseCostPerDay: 85,
    isRiskDropping: true
  },
  {
    id: 'faroe-islands',
    name: 'Faroe Islands',
    country: 'Denmark',
    image: 'https://images.unsplash.com/photo-1527333656061-ca7adf608ae1?auto=format&fit=crop&w=800&q=80',
    status: 'Recommended',
    metrics: { 
      airQualityAQI: 14, 
      waterPPM: 28, 
      soilPPM: 15, 
      noiseDB: 35, 
      crowdDensity: 0.15, 
      infraLoad: 18 
    },
    localSignals: ["Road closures for sheep migration expected next week"],
    communityFeedback: [],
    tags: ['Rugged', 'Islands', 'Eco'],
    description: 'Pristine islands focused on preservation over volume.',
    baseCostPerDay: 120
  },
  {
    id: 'kyoto-japan',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    status: 'Caution Advised',
    metrics: { 
      airQualityAQI: 65, // Moderate
      waterPPM: 150, // Standard
      soilPPM: 80, 
      noiseDB: 68, // Urban moderate
      crowdDensity: 1.5, // Busy
      infraLoad: 75 
    },
    localSignals: ["Cherry blossom peak crowds reported"],
    communityFeedback: [{ id: '3', user: 'SakuraFan', comment: 'Beautiful but temples are packed.', date: '2 days ago', rating: 4 }],
    tags: ['Temples', 'Nature', 'Seasonal'],
    description: 'High seasonal demand puts stress on local spiritual sites.',
    baseCostPerDay: 110,
    isRiskDropping: true
  },
  {
    id: 'venice-italy',
    name: 'Venice',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
    status: 'Not Recommended',
    metrics: { 
      airQualityAQI: 145, // Unhealthy for sensitive groups
      waterPPM: 850, // Poor
      soilPPM: 420, 
      noiseDB: 82, // Loud
      crowdDensity: 3.8, // Dense
      infraLoad: 95 
    },
    localSignals: ["Heavy congestion alert in St. Mark's Square", "High tide warning (Acqua Alta)"],
    communityFeedback: [{ id: '1', user: 'EcoTraveler99', comment: 'Way too crowded.', date: 'Today', rating: 2 }],
    tags: ['Cultural', 'Historic', 'Overcrowded'],
    description: 'Facing extreme climate risks and overwhelming crowd pressure.',
    baseCostPerDay: 130
  },
  {
    id: 'santorini-greece',
    name: 'Santorini',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
    status: 'Not Recommended',
    metrics: { 
      airQualityAQI: 120, 
      waterPPM: 950, 
      soilPPM: 310, 
      noiseDB: 94, // Very Loud
      crowdDensity: 4.2, 
      infraLoad: 98 
    },
    localSignals: ["Water rationing in effect for summer season"],
    communityFeedback: [],
    tags: ['Luxury', 'Views', 'Stressed'],
    description: 'Iconic views but severe water scarcity and tourism fatigue.',
    baseCostPerDay: 180
  }
];

export const MOCK_ROUTES = (destName: string): TravelRoute[] => [
  { id: 'r1', type: 'rail', time: '12h 30m', ecoScore: 95, crowdLevel: 40, comfort: 85, safety: 98, price: 120 },
  { id: 'r2', type: 'air', time: '2h 15m', ecoScore: 20, crowdLevel: 80, comfort: 60, safety: 95, price: 210 },
  { id: 'r3', type: 'road', time: '15h 00m', ecoScore: 45, crowdLevel: 60, comfort: 70, safety: 85, price: 90 },
  { id: 'r4', type: 'mixed', time: '10h 45m', ecoScore: 70, crowdLevel: 50, comfort: 75, safety: 90, price: 150 }
];

export const EXPERIENCE_IMAGES = {
  food: {
    budget: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80",
    standard: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    premium: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80"
  },
  stay: {
    budget: "https://images.unsplash.com/photo-1555854816-80ef7b853926?auto=format&fit=crop&w=400&q=80",
    standard: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
    premium: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=400&q=80"
  }
};
