
// These are your PUBLIC Supabase URL and Anon Key.
// They are meant to be used in client-side applications like this Chrome extension.
// Data security is primarily handled by your Row Level Security (RLS) policies
// in your Supabase database, NOT by keeping these keys secret.
// Ensure your Supabase project has RLS enabled and appropriate policies set up.

const SUPABASE_URL = 'https://nkmymrhmgaolschqhaoa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbXltcmhtZ2FvbHNjaHFoYW9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjgzNTcsImV4cCI6MjA2NTE0NDM1N30.tdse6QgVjKC6R-rPAg9TiqxO5tOL2iiFvZ3zI_CcJPY';

let supabase;

try {
  // Explicitly check if the Supabase library (supabase.js) has been loaded and has defined window.supabase
  if (typeof window.supabase === 'undefined' || typeof window.supabase.createClient !== 'function') {
    console.error(
      'PromptWeaver Error: Supabase client library (window.supabase) not found or invalid. ' +
      'Please ensure you have downloaded the Supabase JS library and pasted its content into extension/lib/supabase.js. ' +
      'Authentication and database features will not work correctly.'
    );
    // Fallback to a mock client if Supabase is not properly configured or library not loaded
    supabase = {
      auth: {
        getSession: async () => { console.warn('Mock getSession: Supabase not fully configured.'); return ({ data: { session: null }, error: null }); },
        signInWithOAuth: async (options) => { console.warn('Mock signInWithOAuth. Supabase not configured or library not loaded.', options); return { error: { message: 'Supabase not configured.'} }; },
        signInWithPassword: async (credentials) => { console.warn('Mock signInWithPassword. Supabase not configured or library not loaded.', credentials); return { error: { message: 'Supabase not configured.'} }; },
        signUp: async (credentials) => { console.warn('Mock signUp. Supabase not configured or library not loaded.', credentials); return { error: { message: 'Supabase not configured.'} }; },
        signOut: async () => { console.warn('Mock signOut. Supabase not configured or library not loaded.'); return { error: null }; },
        onAuthStateChange: (callback) => {
          console.warn('Mock onAuthStateChange. Supabase not configured or library not loaded.');
          // Simulating the structure returned by onAuthStateChange
          const subscription = {
            unsubscribe: () => {
              console.log('Mock subscription unsubscribed.');
            },
          };
          // Call the callback once with an initial state (e.g., no session)
          // You might want to delay this or call it based on some mock event
          // For simplicity, calling immediately with no session.
          Promise.resolve().then(() => callback('INITIAL_SESSION', null));
          return { data: { subscription } };
        }
      },
    };
  } else if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('PromptWeaver Error: Supabase URL or Anon Key is missing in extension/lib/supabaseClient.js.');
     // Fallback to a mock client
    supabase = {
      auth: {
        // (Same mock implementation as above)
        getSession: async () => { console.warn('Mock getSession: Supabase URL/Key missing.'); return ({ data: { session: null }, error: null }); },
        signInWithOAuth: async (options) => { console.warn('Mock signInWithOAuth. Supabase URL/Key missing.', options); return { error: { message: 'Supabase not configured. URL/Key missing.'} }; },
        signInWithPassword: async (credentials) => { console.warn('Mock signInWithPassword. Supabase URL/Key missing.', credentials); return { error: { message: 'Supabase not configured. URL/Key missing.'} }; },
        signUp: async (credentials) => { console.warn('Mock signUp. Supabase URL/Key missing.', credentials); return { error: { message: 'Supabase not configured. URL/Key missing.'} }; },
        signOut: async () => { console.warn('Mock signOut. Supabase URL/Key missing.'); return { error: null }; },
        onAuthStateChange: (callback) => {
          console.warn('Mock onAuthStateChange. Supabase URL/Key missing.');
          const subscription = { unsubscribe: () => {} };
          Promise.resolve().then(() => callback('INITIAL_SESSION', null));
          return { data: { subscription } };
        }
      },
    };
  } else {
    // If window.supabase is available and URL/Key are present, create the actual client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

} catch (error) {
  console.error('PromptWeaver Error: Error initializing Supabase client in extension/lib/supabaseClient.js:', error);
  if (!supabase) { // Ensure supabase is an object even if initialization failed catastrophically
    supabase = { auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} }}}) }};
  }
}

// Make it globally available to other extension scripts if it's not already (e.g. if supabase.js didn't do it)
// This is a bit redundant if supabase.js correctly sets window.supabase, but acts as a fallback.
if (typeof window !== 'undefined') {
  if (!window.supabaseInstance) { // Use a different name to avoid conflict with the library itself
      window.supabaseInstance = supabase;
  }
}
