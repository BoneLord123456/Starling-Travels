
import { Destination, User, TourGuide, DestinationStatus, Booking, TripStatus } from '../types';
import { MOCK_DESTINATIONS, MOCK_GUIDES } from '../constants';

const GOOGLE_SHEET_BASE_URL = 'https://docs.google.com/spreadsheets/d/1OE7X1_M6obW9You92p-wm33jmNnUbhEZwyUdXSvstIk/export?format=csv';
const DEMO_PLACE_ID = 'demo-place-live';

export const apiService = {
  cleanNum(val: string): number {
    if (!val) return 0;
    const cleaned = val.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  },

  mapStatus(sheetStatus: string): DestinationStatus {
    const s = sheetStatus?.toLowerCase() || '';
    if (s.includes('critical') || s.includes('danger')) return 'Risky';
    if (s.includes('unsafe') || s.includes('high')) return 'Risky';
    if (s.includes('caution') || s.includes('warning') || s.includes('moderate')) return 'Caution Advised';
    if (s.includes('safe') || s.includes('excellent') || s.includes('low')) return 'Recommended';
    if (s.includes('closure') || s.includes('stop')) return 'Not Recommended';
    return 'Recommended';
  },

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
    const user: User = { ...userData, ecoPoints: 0, loyaltyTier: 'Green Explorer' };
    localStorage.setItem('ecobalance-user', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('ecobalance-user');
    localStorage.removeItem('starling-premium');
    localStorage.removeItem('ecobalance-bookings');
  },

  async saveBooking(booking: Booking): Promise<void> {
    const bookings = JSON.parse(localStorage.getItem('ecobalance-bookings') || '[]');
    bookings.push(booking);
    localStorage.setItem('ecobalance-bookings', JSON.stringify(bookings));
    
    const user = JSON.parse(localStorage.getItem('ecobalance-user') || '{}');
    if (user.name) {
      user.ecoPoints = (user.ecoPoints || 0) + booking.ecoPointsEarned;
      if (user.ecoPoints > 1000) user.loyaltyTier = 'Planet Partner';
      else if (user.ecoPoints > 500) user.loyaltyTier = 'Earth Guardian';
      localStorage.setItem('ecobalance-user', JSON.stringify(user));
    }
  },

  async cancelBooking(bookingId: string, refundAmount: number): Promise<void> {
    const bookings: Booking[] = JSON.parse(localStorage.getItem('ecobalance-bookings') || '[]');
    const updated = bookings.map(b => 
      b.id === bookingId ? { ...b, status: 'Cancelled' as TripStatus, refundAmount } : b
    );
    localStorage.setItem('ecobalance-bookings', JSON.stringify(updated));
  },

  async getBookings(): Promise<Booking[]> {
    return JSON.parse(localStorage.getItem('ecobalance-bookings') || '[]');
  },

  async getActiveBooking(): Promise<Booking | null> {
    const bookings = await this.getBookings();
    const active = bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed');
    return active.length > 0 ? active[active.length - 1] : null;
  },

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
      const latestData = allRows[allRows.length - 1];
      const demoMock = MOCK_DESTINATIONS.find(d => d.id === DEMO_PLACE_ID);
      return {
        metrics: {
          airQualityAQI: demoMock?.metrics.airQualityAQI || 20,
          waterPPM: demoMock?.metrics.waterPPM || 50,
          soilPPM: this.cleanNum(latestData[4]),
          noiseDB: this.cleanNum(latestData[3]),
          crowdDensity: demoMock?.metrics.crowdDensity || 0.2,
          infraLoad: demoMock?.metrics.infraLoad || 20,
          ecoStress: this.cleanNum(latestData[5]),
          temperature: 24.5,
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

  async getDestinations(): Promise<Destination[]> {
    const liveData = await this.fetchLiveDemoData();
    return MOCK_DESTINATIONS.map(d => {
      const baseMetrics = d.metrics;
      if (d.id === DEMO_PLACE_ID && liveData) {
        return { 
          ...d, 
          metrics: { ...baseMetrics, ...liveData.metrics }, 
          status: liveData.status || d.status,
          localSignals: liveData.localSignals || d.localSignals,
        } as Destination;
      }
      return d;
    });
  },

  async getDestinationById(id: string): Promise<Destination | undefined> {
    const destinations = await this.getDestinations();
    return destinations.find(d => d.id === id);
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
