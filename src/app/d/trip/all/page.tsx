"use client"

import { TripCard } from "@components/TripCard";
import { useAllTrips } from "@hooks/useAllTrips"
import Link from "next/link";

export default function AllTrips() {
    const { loading, error, trips } = useAllTrips();
    
    if (loading)    return <p>Loading trips...</p>;
    if (error)  return <p>Error fetching trips</p>

    return (
        <div className="w-1/2 mx-auto mt-32 text-sm">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg">All Trips</h2>
                    <code className="text-neutral-500">Everything, everywhere, all at once.</code>
                </div>
                <Link href="/d/trip/create" className="bg-yellow-500 text-neutral-900 rounded-sm px-3 py-1">New trip</Link>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-8">
                {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    trips.map((trip: any) => <TripCard key={trip.id} destinationType={trip.metadata.destinationType} {...trip} link={trip.id} />)
                }
            </div>
        </div>
    )
}