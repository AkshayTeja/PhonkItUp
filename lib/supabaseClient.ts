import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nlxyjszbkozxdnheznvk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seHlqc3pia296eGRuaGV6bnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3OTM4MTYsImV4cCI6MjA2NDM2OTgxNn0.LcU29RenWKnAfCJSS0Q3RwtP5f-2URpM3XuYPJ0p2KQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
