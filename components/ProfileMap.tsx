"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_TRIPS_BY_USERNAME_QUERY } from '@graphql/queries/user';
import { TripType } from '@lib/types';

// Fix for default Leaflet icon not appearing in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapProps {
    username: string;
    isExpanded: boolean;
}

export const ProfileMap = (props: MapProps) => {
    const { data, loading, error } = useQuery(GET_TRIPS_BY_USERNAME_QUERY, {
        variables: { username: props?.username },
        skip: !props?.username,
    });

    if (loading) return <p className="text-center mt-8">Loading map...</p>;
    if (error) return <p className="text-center mt-8">Error loading map</p>;

    const trips = data?.tripsByUsername || [];
    const tripsWithCoords = trips.filter((trip: TripType) => trip.destinationCoordinates);
    return (
        <MapContainer
            key={props.isExpanded ? 'expanded' : 'collapsed'}
            center={[20, 0]} // Default center
            zoom={2}
            zoomControl={props?.isExpanded}
            dragging={props?.isExpanded}
            style={{ height: '100%', width: '100%' }}
            className={`rounded-b-md ${props?.isExpanded ? 'z-20' : 'z-0'}`}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {tripsWithCoords.map((trip: any) => {
                const [lat, lon] = trip.destinationCoordinates.split(',').map(Number);

                if (isNaN(lat) || isNaN(lon)) return null;

                return (
                    <Marker key={trip.id} position={[lat, lon]} riseOnHover>
                        <Popup className='p-0'>
                            <h3 className="font-bold text-sm">{trip.name}</h3>
                            <p className="text-gray-600">{trip.metadata.totalDays} days in {trip.destination}</p>
                            <Link target='_blank' href={`/d/trip/${trip.id}`} className="text-yellow-600 hover:underline block">
                                View trip {">>"}
                            </Link>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    )
}