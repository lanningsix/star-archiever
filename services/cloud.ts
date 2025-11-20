import { CLOUD_API_URL } from '../constants';
import { AppState, Task, Reward, Transaction } from '../types';

export interface CloudData {
  tasks: Task[];
  rewards: Reward[];
  logs: Record<string, string[]>;
  balance: number;
  transactions: Transaction[];
  themeKey: string;
  userName: string;
  lastUpdated: number;
}

export const cloudService = {
  // Generate a random Family ID
  generateFamilyId: () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  },

  // Load data from Cloudflare Worker
  loadData: async (familyId: string): Promise<CloudData | null> => {
    if (CLOUD_API_URL.includes('example')) {
        console.warn('Cloud Sync Skipped: API URL is not configured in constants.ts');
        return null;
    }
    try {
      const response = await fetch(`${CLOUD_API_URL}?familyId=${familyId}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json();
      return json.data;
    } catch (error) {
      console.error("Failed to load cloud data:", error);
      throw error;
    }
  },

  // Save data to Cloudflare Worker
  saveData: async (familyId: string, data: Omit<CloudData, 'lastUpdated'>): Promise<boolean> => {
    if (CLOUD_API_URL.includes('example')) {
        // Simulate success for UI testing if URL is not set
        return new Promise(resolve => setTimeout(() => resolve(true), 500));
    }
    try {
      const payload = {
        ...data,
        lastUpdated: Date.now()
      };
      
      const response = await fetch(`${CLOUD_API_URL}?familyId=${familyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      return response.ok;
    } catch (error) {
      console.error("Failed to save cloud data:", error);
      return false;
    }
  }
};