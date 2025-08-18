import { User as SupabaseUser } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface User extends SupabaseUser {
    image?: string;
    display_name?: string;
    name?:string
  }
}