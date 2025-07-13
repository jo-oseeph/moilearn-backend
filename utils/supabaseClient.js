import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// load values from .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(" Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
}

// create the client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log(` Supabase client initialized with URL: ${supabaseUrl}`);

export default supabase;
