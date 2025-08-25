import { useMutation } from "@apollo/client";
import { SIGN_IN_WITH_OTP_MUTATION } from "@graphql/mutations/user";
import { supabase } from "@lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useLogin = () => {
        const router = useRouter();
        const [email, setEmail] = useState('');
        const [linkSent, setLinkSent] = useState(false);
        const [signInWithOtp, { loading: otpLoading }] = useMutation(SIGN_IN_WITH_OTP_MUTATION);

        const handleMagicLinkLogin = async (e: React.FormEvent) => {
            e.preventDefault();
            try {
                await signInWithOtp({ variables: { email } });
                setLinkSent(true); // Show the confirmation message
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                alert(`Error sending magic link: ${err.message}`);
            }
        };
    
        const handleSignOut = async () => {
            await supabase.auth.signOut();
            // Redirect to the login page after signing out
            router.push('/');
        };
    
        return {
            setEmail,
            handleSignOut,
            handleMagicLinkLogin,
            signInWithOtp,
            email,
            otpLoading,
            linkSent
        }
}