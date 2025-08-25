"use client"

import { Navbar } from "@components/Navbar";
import { useAuth } from "@hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !session) router.push("/");
  }, [router, session, loading]);

  return (
    <div className="min-h-screen max-w-3/4 mx-auto">
      <Navbar />
      <div className="my-4 p-4 min-h-screen rounded-xl bg-neutral-900/50">
        {children}
      </div>
    </div>
  )
}