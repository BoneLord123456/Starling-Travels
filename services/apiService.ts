
import { Destination, User, TourGuide, DestinationStatus } from '../types';
import { MOCK_DESTINATIONS, MOCK_GUIDES } from '../constants';

const GOOGLE_SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/1OE7X1_M6obW9You92p-wm33jmNnUbhEZwyUdXSvstIk/export?format=csv';
const DEMO_PLACE_ID = 'demo-place-live';

export const apiService = {
  // Helper to clean numeric values from sheet
  cleanNum(val: string): number {
    if (!val) return 0;
    const cleaned = val.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  },

  // Map sheet status to internal app status
  mapStatus(sheetStatus: string): DestinationStatus {
    const s = sheetStatus?.toLowerCase() || '';
    if (s.includes('critical') || s.includes('danger')) return 'Risky';
    if (s.includes('unsafe') || s.includes('high')) return 'Risky';
    if (s.includes('caution') || s.includes('warning') || s.includes('moderate')) return 'Caution Advised';
    if (s.includes('safe') || s.includes('excellent') || s.includes('low')) return 'Recommended';
    if (s.includes('closure') || s.includes('stop')) return 'Not Recommended';
    return 'Recommended';
  },

  // --- AUTHENTICATION ---
  async login(email: string, passwordHash: string): Promise<User | null> {
    const saved = localStorage.getItem('ecobalance-user');
    if (saved) {
      const user = JSON.parse(saved);
      if (user.email === email && user.passwordHash === passwordHash) {
        return user;
      }
    }
    return null;
  },

  async signup(userData: User): Promise<User> {
    localStorage.setItem('ecobalance-user', JSON.stringify(userData));
    return userData;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('ecobalance-user');
    localStorage.removeItem('starling-premium');
  },

  // --- GOOGLE SHEETS SYNC ---
  async fetchLiveDemoData(): Promise<Partial<Destination> & { lastSync: string } | null> {
    try {
      const cacheBuster = `&t=${Date.now()}`;
      const response = await fetch(`${GOOGLE_SHEET_BASE_URL}${cacheBuster}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch Google Sheet');
      
      const text = await response.text();
      const allRows = text.split(/\r?\n/).filter(row => row.trim().length > 0).map(row => {
        return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => 
          cell.replace(/^"|"$/g, '').trim()
        );
      });
      
      if (allRows.length < 2) return null;
      
      /**
       * MAPPING BASED ON USER SCREENSHOT:
       * Index 0 (A): Time
       * Index 1 (B): SoundRaw
       * Index 2 (C): SoilRaw
       * Index 3 (D): SoundStress -> noiseDB (Reading out of 100)
       * Index 4 (E): SoilStress -> soilPPM (Reading out of 100)
       * Index 5 (F): EcoStress
       * Index 6 (G): Status
       * Index 7 (H): Advisory
       */
      
      const latestData = allRows[allRows.length - 1];
      const demoMock = MOCK_DESTINATIONS.find(d => d.id === DEMO_PLACE_ID);
      
      return {
        metrics: {
          airQualityAQI: demoMock?.metrics.airQualityAQI || 20,
          waterPPM: demoMock?.metrics.waterPPM || 50,
          soilPPM: this.cleanNum(latestData[4]), // Use SoilStress (Col E)
          noiseDB: this.cleanNum(latestData[3]), // Use SoundStress (Col D)
          crowdDensity: demoMock?.metrics.crowdDensity || 0.2,
          infraLoad: demoMock?.metrics.infraLoad || 20,
        },
        status: this.mapStatus(latestData[6]),
        lastSync: latestData[0] || new Date().toLocaleTimeString(),
        localSignals: [latestData[7] || "Stable Environment"]
      };
    } catch (error) {
      console.error('API: Google Sheets Error:', error);
      return null;
    }
  },

  // --- DESTINATIONS ---
  async getDestinations(): Promise<Destination[]> {
    const liveData = await this.fetchLiveDemoData();
    
    return MOCK_DESTINATIONS.map(d => {
      if (d.id === DEMO_PLACE_ID && liveData) {
        return { 
          ...d, 
          metrics: liveData.metrics || d.metrics, 
          status: liveData.status || d.status,
          localSignals: liveData.localSignals || d.localSignals,
          description: `Live Feed Active. Last reading: ${liveData.lastSync}`
        } as Destination;
      }
      return d;
    });
  },

  async getDestinationById(id: string): Promise<Destination | undefined> {
    const destination = MOCK_DESTINATIONS.find(d => d.id === id);
    if (!destination) return undefined;

    if (id === DEMO_PLACE_ID) {
      const liveData = await this.fetchLiveDemoData();
      if (liveData) {
        return { 
          ...destination, 
          metrics: liveData.metrics || destination.metrics, 
          status: liveData.status || destination.status,
          localSignals: liveData.localSignals || destination.localSignals,
          description: `Live Feed Active. Last reading: ${liveData.lastSync}`
        } as Destination;
      }
    }
    return destination;
  },

  async updatePremiumStatus(isPremium: boolean): Promise<void> {
    const saved = localStorage.getItem('ecobalance-user');
    if (saved) {
      const user = JSON.parse(saved);
      user.isPremium = isPremium;
      localStorage.setItem('ecobalance-user', JSON.stringify(user));
    }
    localStorage.setItem('starling-premium', isPremium ? 'true' : 'false');
  }
};
