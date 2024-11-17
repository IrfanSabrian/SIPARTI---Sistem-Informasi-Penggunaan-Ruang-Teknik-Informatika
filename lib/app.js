import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://<your-supabase-url>.supabase.io';
const supabaseKey = '<your-supabase-key>';
const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      'x-my-custom-header': 'hello from my app',
    },
  },
});
