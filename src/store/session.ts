import { create } from 'zustand';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY';
// Demo-only rates; the UI states this wherever currency can be changed.
export const RATES: Record<Currency, number> = { USD: 1, EUR: 0.92, GBP: 0.79, NGN: 1500, JPY: 150 };
export const SYMBOL: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£', NGN: '₦', JPY: '¥' };
interface S {
  ready: boolean; userId: string | null; firstName: string; lastName: string; email: string; role: string; currency: Currency; dark: boolean; saved: Record<string, true>;
  set: (p: Partial<S>) => void; toggleSaved: (k: string) => void;
}
export const useSession = create<S>((set) => ({
  ready: false, userId: null, firstName: 'Frank', lastName: 'Oge', email: '', role: 'customer', currency: 'USD', dark: false, saved: {},
  set: (p) => set(p), toggleSaved: (k) => set((s) => { const n = { ...s.saved }; if (n[k]) delete n[k]; else n[k] = true; return { saved: n }; }),
}));
export const money = (usd: number, c: Currency) => `${SYMBOL[c]}${Math.round(usd * RATES[c]).toLocaleString('en-US')}`;
