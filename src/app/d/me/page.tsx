"use client";

import { useQuery } from "@apollo/client";
import { Dots } from "@components/Dots";
import { ProfileMap } from "@components/ProfileMap";
import { ME_QUERY, STATS_QUERY } from "@graphql/queries/user";
import { useState } from "react";

export default function Profile() {
    const { data: user, error: userError, loading: loadingUser } = useQuery(ME_QUERY);
    const { data: stats, error: statsError, loading: loadingStats } = useQuery(STATS_QUERY);
    const [isExpanded, setIsExpanded] = useState(false);

    if (userError || statsError)
        return <p>Error</p>

    if (loadingUser || loadingStats)
        return <p>Loading...</p>
    
    const {
        totalTrips,
        totalCountries,
        totalDays
    } = stats.stats;

    return (
        <div className="w-1/2 mx-auto mt-32">
            <div className="p-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl text-yellow-600">
                            @{user?.me?.username}
                        </h2>
                        <p>Joined on 02 December 2025</p>
                    </div>
                    <div className="bg-neutral-800 h-10 w-10 rounded-full"></div>
                </div>
                <div className="mt-2">
                <div className='rounded-t-md top-0 z-10 bg-neutral-800 w-full'>
                    <div className="h-full flex justify-end px-3 py-2">
                        <p className="text-sm text-neutral-300 underline" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? 'Collapse' : 'Expand'}
                        </p>
                    </div>
                </div>
                <div className={`w-full rounded-b-md bg-neutral-800 transition-all duration-500 ease-in-out ${isExpanded ? 'h-96' : 'h-48'}`}>
                    <ProfileMap username={user.me.username} isExpanded={isExpanded} />
                </div>
                </div>
                <div className="flex my-3 gap-2">
                    <div className="flex-grow border border-neutral-800 rounded-sm p-3">
                        <p className="text-sm uppercase text-yellow-100">Longest trip</p>
                        <p>{stats.stats.longestTrip.days} day trip to {stats.stats.longestTrip.country}</p>
                    </div>
                    <div className="flex-grow border border-neutral-800 rounded-sm p-3">
                        <p className="text-sm uppercase text-yellow-100">Shortest trip</p>
                        <p>{stats.stats.shortestTrip.days} day trip to {stats.stats.shortestTrip.country}</p>
                    </div>
                    <div className="flex-grow border border-neutral-800 rounded-sm p-3">
                        <p className="text-sm uppercase text-yellow-100">Most visited country</p>
                        <p>{stats.stats.mostVisitedCountry.visitCount} times to {stats.stats.mostVisitedCountry.country}</p>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center gap-4">
                        <Dots count={totalTrips} context="trips" />
                        <div className="w-1/2">
                            <h4 className="text-4xl">{totalTrips} trips</h4>
                            <p className="text-lg">You have traveled quite a bit</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="w-1/2">
                            <h4 className="text-4xl">{totalCountries} countries</h4>
                            <p className="text-lg">Our very own Columbus</p>
                        </div>
                        <Dots count={totalCountries} context="countries" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <Dots count={totalDays} context="days" />
                        <div className="w-1/2">
                            <h4 className="text-4xl">{totalDays} days</h4>
                            <p className="text-lg">There&apos;s commitment and there&apos;s this</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}