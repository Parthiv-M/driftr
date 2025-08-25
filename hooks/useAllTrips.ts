"use client";

import { useQuery } from "@apollo/client";
import { GET_MY_TRIPS_QUERY } from "@graphql/queries/trip";

export const useAllTrips = () => {
    const { data, loading, error } = useQuery(GET_MY_TRIPS_QUERY);
    const trips = data?.myTrips || [];
    return {
        loading,
        error,
        trips
    }
}