import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { getSecret } from '../utils/crypto.js';

dotenv.config();

const supabaseUrl = getSecret('SUPABASE_URL').replace(/["']/g, '').trim();
const supabaseServiceKey = getSecret('SUPABASE_SERVICE_ROLE_KEY').replace(/["']/g, '').trim();

console.log('Supabase Config Debug:');
console.log(`URL Length: ${supabaseUrl.length}`);
console.log(`URL Start: "${supabaseUrl.substring(0, 12)}..."`); // Show first 12 chars to check for 'https://' or garbage
console.log(`Key Length: ${supabaseServiceKey ? supabaseServiceKey.length : 0}`);

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables');
    process.exit(1);
}

// Use service role key for full admin access (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
