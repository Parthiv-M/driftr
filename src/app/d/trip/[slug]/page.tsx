"use client"

import { useQuery } from "@apollo/client";
import { ArrowUp } from "@components/icons/ArrowUp";
import { TripMetaInfoCard } from "@components/TripMetaInfoCard";
import { GET_TRIP_BY_ID_QUERY } from "@graphql/queries/trip"
import { TripType } from "@lib/types";
import { formatDate } from "@lib/utils";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { remark } from 'remark';
import html from 'remark-html';

export default function Trip() {
  const params = useParams();
  const { slug } = params;

  const [packingListHtml, setPackingListHtml] = useState('');

  const { data, loading, error } = useQuery(GET_TRIP_BY_ID_QUERY, {
    variables: { id: slug },
    skip: !slug, // Don't run the query if the slug isn't available yet
  });

  useEffect(() => {
    const generateHtml = async () => {
      if (data?.trip?.packingList) {
        const processedContent = await remark().use(html).process(data.trip.packingList);
        setPackingListHtml(processedContent.toString());
      }
    };
    generateHtml();
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error...</p>;

  const trip: TripType = data?.trip;

  if (!trip) {
    return (
      <div>
        <p>Trip not found.</p>
      </div>
    );
  }

  return (
    <div className="w-1/2 mx-auto mt-32 text-sm">
      {trip?.coverImage && <Image className="grayscale hover:grayscale-20 mb-16 rounded-t-xl" src={trip?.coverImage} alt={trip?.name} width={'800'} height={'400'} objectFit="fill" />}
      <p>Traveling to <span className="text-yellow-500">{trip?.destination}</span> {trip?.destinationCoordinates && "•"} <span>{trip?.destinationCoordinates}</span></p>
      <h2 className="text-3xl">{trip?.name}</h2>
      <p className="mt-1 text-neutral-600">
        <span className="text-neutral-500">{formatDate(trip?.startsOn)} </span>
        to
        <span className="text-neutral-500"> {formatDate(trip?.endsOn)}</span>
      </p>
      <div className="mt-16 gap-8 grid grid-cols-5">
        <TripMetaInfoCard dataInSpan={trip?.metadata.totalDays.toString()} dataAfterSpan={`${trip?.metadata?.totalDays === 1 ? "day" : "days"}`} />
        <TripMetaInfoCard dataBeforeSpan="It's a" dataInSpan={trip?.metadata.destinationType} />
        <TripMetaInfoCard dataBeforeSpan="Taking the" dataInSpan={trip?.travelMode} />
        <TripMetaInfoCard dataInSpan="" dataAfterSpan={trip?.metadata.country} />
        <TripMetaInfoCard dataInSpan="" dataAfterSpan={trip?.metadata.continent} />
      </div>
      <p className="mt-8 text-md text-yellow-100 uppercase">Important links</p>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        {trip?.linkTree.googlePhotos && <a href={trip?.linkTree.googlePhotos} target="_blank" className="bg-neutral-900 p-2 rounded-md flex items-center gap-3">
          <span>Google Photos</span>
          <ArrowUp />
        </a>}
        {trip?.linkTree.dropbox && <a href={trip?.linkTree.dropbox} target="_blank" className="bg-neutral-900 p-2 rounded-md flex items-center gap-3">
          <span>Dropbox</span>
          <ArrowUp />
        </a>}
        {trip?.linkTree.googleDrive && <a href={trip?.linkTree.googleDrive} target="_blank" className="bg-neutral-900 p-2 rounded-md flex items-center gap-3">
          <span>Google Drive</span>
          <ArrowUp />
        </a>}
        {trip?.linkTree.travelWebsite && <a href={trip?.linkTree.travelWebsite} target="_blank" className="bg-neutral-900 p-2 rounded-md flex items-center gap-3">
          <span>Google Search</span>
          <ArrowUp />
        </a>}
      </div>
      {
        trip?.linkTree.customLinks &&
        <div className="mt-2 flex flex-wrap items-center">
          {trip?.linkTree.customLinks.map((link: string, index: number) => {
            return <a key={index + '-' + link} href={trip?.linkTree.travelWebsite} target="_blank" className="bg-neutral-900 p-2 rounded-md flex items-center gap-3">
              <span>{link}</span>
              <ArrowUp />
            </a>
          })}
        </div>
      }

      <div className="mt-8 rounded-md bg-neutral-900">
        <div className="p-3 border-b-1 border-neutral-800">
          <h4 className="text-md text-yellow-100">PACKING LIST</h4>
        </div>
        <div className="packing-list text-neutral-400 p-3 pt-0">
          {trip.packingList ? (
            <div
              dangerouslySetInnerHTML={{ __html: packingListHtml }}
            />
          ) : (
            <p className="text-gray-500">No packing list added yet.</p>
          )}
        </div>
      </div>

    </div>
  )
}