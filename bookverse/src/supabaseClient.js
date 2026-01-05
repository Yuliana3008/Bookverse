import { createClient } from '@supabase/supabase-js';

// Reemplaza los valores de las comillas con la información de tus capturas de Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ikorghjmpqjcwsgqmmaq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrb3JnaGptcHFqY3dzZ3FtbWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzA3MzQsImV4cCI6MjA4MzA0NjczNH0.V3BytUfDnWUP0_Op3c78II-tVbBt5SSxSN-uUEH7R4I';

export const supabase = createClient(supabaseUrl, supabaseKey);