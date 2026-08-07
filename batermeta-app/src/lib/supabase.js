import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Mensagem clara no console se o .env não foi configurado.
  // eslint-disable-next-line no-console
  console.error(
    "[BaterMeta] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausentes. " +
      "Configure em .env.local (dev) e em Vercel > Project Settings > Environment Variables (prod)."
  );
}

export const supabase = createClient(url || "", anon || "", {
  auth: {
    // O sistema controla login no app (sem usar Auth do Supabase).
    persistSession: false,
    autoRefreshToken: false,
  },
});
