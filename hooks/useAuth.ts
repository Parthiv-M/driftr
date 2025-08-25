import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';
import { Session } from "@supabase/supabase-js";

export const useAuth = () => {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>();
    
    // This effect correctly handles the session when the user returns from the magic link
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false); // The initial check is complete.
        });
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
            }
        );

        return () => {
            // Clean up the listener when the component unmounts.
            authListener.subscription.unsubscribe();
        };
    }, []);

    return {
        session,
        loading,
    }
}