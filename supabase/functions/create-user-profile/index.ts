// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// Import the username generator directly from npm
import { uniqueUsernameGenerator, Config } from 'npm:unique-username-generator';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configuration for the username generator
const usernameConfig: Config = {
  dictionaries: ['adjectives', 'verbs', 'nouns'],
  separator: '-',
  style: 'lowerCase',
  random: true,
  length: 20,
};

// Main function to handle the request
Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key for elevated privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the new user record from the request body.
    const { record: authUser } = await req.json();

    if (!authUser) {
      throw new Error("No user record found in the webhook payload.");
    }

    // Generate a unique username
    const username = uniqueUsernameGenerator(usernameConfig);

    // Insert the new user's data, including the username, into your public "User" table.
    const { error } = await supabaseAdmin.from('User').insert({
      id: authUser.id,
      email: authUser.email,
      username: username,
    });

    if (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }

    return new Response(JSON.stringify({ message: `Profile created for ${authUser.id} with username ${username}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

