import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jpdwsficcyzuorwblodn.supabase.co';
const supabaseKey = 'sb_publishable_SERV-mLkTH4O1k2DPhHC8Q_qDOE5a89';

export const supabase = createClient(supabaseUrl, supabaseKey);
