import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zyjsolotnqhawtbqgccz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k7xeCrIFhkI7_G-Y0iWazw_65Wx1Dzn';

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
