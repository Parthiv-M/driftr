"use client";

import { useAuth } from "@hooks/useAuth";
import { useLogin } from "@hooks/useLogin";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
  const {
    setEmail,
    handleMagicLinkLogin,
    email,
    otpLoading,
    linkSent,
  } = useLogin();
  const { loading, session } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && session) router.push("/d");
  }, [router, session, loading]);

  return (
    <div className="p-4 max-w-xs mx-auto">
      <form className="flex flex-col gap-4" onSubmit={handleMagicLinkLogin}>
        <h2 className="text-3xl font-bold">Login</h2>
        <p className="text-neutral-500">Enter your email to receive a magic link</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border border-neutral-800 rounded focus:border-neutral-700"
          required
        />
        <button type="submit" className="bg-neutral-900 text-neutral-500 p-2 rounded hover:bg-neutral-900/80" disabled={otpLoading}>
          {otpLoading ? 'Sending...' : 'Send login link'}
        </button>
        {linkSent && (
          <p className="text-yellow-600">
            Link should be in your email now.
          </p>
        )}
      </form>
    </div>
  );
}
