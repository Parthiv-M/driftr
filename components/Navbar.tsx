"use client"

import { useLogin } from "@hooks/useLogin";

export const Navbar = () => {
    const { handleSignOut } = useLogin();
    return (
        <nav className="flex justify-between items-center mt-4 p-2 rounded-full bg-neutral-900 w-1/2 mx-auto">
            <p className="ml-2">driftr</p>
            <button onClick={handleSignOut} className="bg-neutral-800 py-2 px-3 rounded-full hover:bg-neutral-800/60">Sign out</button>
        </nav>
    )
}