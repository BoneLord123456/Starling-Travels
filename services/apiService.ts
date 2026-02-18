
import { Destination, User, TourGuide, DestinationStatus } from '../types';
import { MOCK_DESTINATIONS, MOCK_GUIDES } from '../constants';

const GOOGLE_SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/1OE7X1_M6obW9You92p-wm33jmNnUbhEZwyUdXSvstIk/export?format=csv';
const DEMO_PLACE_ID = 'demo-place-live';

export const apiService = {
  // Helper to clean numeric values from sheet (e.g., "174.25" -> 174.25)
  cleanNum(val: string): number {
    if (!val) return 0;
    const cleaned = val.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  },

  // Map sheet status to internal app status
  mapStatus(sheetStatus: string): DestinationStatus {
    const s = sheetStatus?.toLowerCase() || '';
    if (s.includes('critical') || s.includes('risky') || s.includes('danger')) return 'Risky';
    if (s.includes('caution') || s.includes('warning') || s.includes('high')) return 'Caution Advised';
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
      // CACHE BUSTING: Forced refresh
      const cacheBuster = `&t=${Date.now()}`;
      const response = await fetch(`${GOOGLE_SHEET_BASE_URL}${cacheBuster}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      
      if (!response.ok) throw new Error('Failed to fetch Google Sheet');
      
      const text = await response.text();
      
      // Robust CSV parsing
      const allRows = text.split(/\r?\n/).filter(row => row.trim().length > 0).map(row => {
        return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => 
          cell.replace(/^"|"$/g, '').trim()
        );
      });
      
      if (allRows.length < 2) return null;
      
      /**
       * MAPPING BASED ON USER SCREENSHOT:
       * Index 0 (A): Time
       * Index 1 (B): SoundRaw -> noiseDB
       * Index 2 (C): SoilRaw -> soilPPM
       * Index 3 (D): SoundStress
       * Index 4 (E): SoilStress
       * Index 5 (F): EcoStress -> infraLoad (as a % of stress)
       * Index 6 (G): Status -> overall status
       * Index 7 (H): Advisory
       */
      
      // We take the LAST row because the sheet is a log
      const latestData = allRows[allRows.length - 1];
      console.debug('API: Syncing Latest Row:', latestData);
      
      return {
        metrics: {
          airQualityAQI: this.cleanNum(latestData[3]) || 25, // Fallback if not specifically in sheet
          waterPPM: this.cleanNum(latestData[4]) || 40,    // Fallback if not specifically in sheet
          soilPPM: this.cleanNum(latestData[2]),          // SoilRaw from Col C
          noiseDB: this.cleanNum(latestData[1]),          // SoundRaw from Col B
          crowdDensity: 0.5,                               // Static fallback
          infraLoad: this.cleanNum(latestData[5]),        // EcoStress from Col F
        },
        status: this.mapStatus(latestData[6]),            // Status from Col G
        lastSync: latestData[0] || new Date().toLocaleTimeString(),
        localSignals: [latestData[7] || "Stable Environment"] // Advisory from Col H
      };
    } catch (error) {
      console.error('API: Google Sheets Sync Error:', error);
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
