import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://mtwunmiehjbsbthvbezw.supabase.co';

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10d3VubWllaGpic2J0aHZiZXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNjE0MzUsImV4cCI6MjEwNDgzNzQzNX0.DZNx5wzOX-Btyom2gA13sOk22uWm7RqYUq4KnaTE2tg';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );

