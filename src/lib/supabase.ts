import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zeqprjrmjwfwmoddedhb.supabase.co';
const supabaseAnonKey = 'sb_publishable_oMg0jKz_IDTcvBM-_IqwJA_tDA2LC2Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface FinancialCloseMetric {
  id: string;
  period: string;
  close_days: number;
  automation_rate: number;
  reconciliation_items: number;
  region: string;
  department: string;
  created_at: string;
}

export interface ProcessEfficiency {
  id: string;
  process_name: string;
  cycle_time: number;
  error_rate: number;
  cost: number;
  date: string;
  category: string;
  status: string;
  created_at: string;
}
