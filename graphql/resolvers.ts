/* eslint-disable @typescript-eslint/no-explicit-any */
import { dateScalar } from './helpers/scalars';
import { GraphQLError } from 'graphql';
import { MyContext } from '@/app/api/graphql/route';
import prisma from '@lib/prisma';
import { buildPromptForLLM } from '@lib/utils';
import { unsplashAPI } from '@lib/unsplash';
import { DestinationType } from '@prisma/client';
import { GEMINI_API_URL } from '@lib/constants';

export const resolvers = {
  DateTime: dateScalar,
  Query: {
    me: async (_parent: any, _args: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userProfile = await prisma.user.findUnique({
        where: { id: context.user.id },
      });

      return userProfile;
    },
    myTrips: async (_parent: any, _args: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      return await prisma.trip.findMany({
        where: { userId: context.user.id },
        include: { metadata: true },
        orderBy: { startsOn: 'desc' }
      });
    },
    trip: async (_parent: any, { id }: { id: string }, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const trip = await prisma.trip.findUnique({
        where: { id },
        include: { linkTree: true, metadata: true, user: true },
      });

      if (trip?.userId !== context.user.id) {
        throw new GraphQLError('Not authorized', { extensions: { code: 'FORBIDDEN' } });
      }

      return trip;
    },
    stats: async (_parent: any, _args: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const [stats, trips] = await Promise.all([
        // Aggregation query
        prisma.trip.aggregate({
          where: { userId: context.user.id },
          _count: { id: true }
        }),

        // Get trips with metadata for country analysis and trip details
        prisma.trip.findMany({
          where: { userId: context.user.id },
          include: { metadata: true },
          orderBy: { metadata: { totalDays: 'desc' } }
        })
      ]);

      if (trips.length === 0) {
        return {
          totalTrips: 0,
          totalCountries: 0,
          totalDays: 0,
          longestTrip: null,
          shortestTrip: null,
          mostVisitedCountry: null
        };
      }

      // Calculate unique countries and total days
      const countries = trips
        .map(trip => trip.metadata?.country)
        .filter(Boolean) as string[];

      const uniqueCountries = new Set(countries);
      const totalDays = trips.reduce((sum, trip) =>
        sum + (trip.metadata?.totalDays || 0), 0
      );

      // Find longest and shortest trips
      const tripsWithDays = trips.filter(trip => trip.metadata?.totalDays);
      const longestTrip = tripsWithDays[0];
      const shortestTrip = tripsWithDays[tripsWithDays.length - 1];

      // Calculate most visited country
      const countryFrequency = countries.reduce((acc, country) => {
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostVisitedEntry = Object.entries(countryFrequency)
        .sort(([, a], [, b]) => b - a)[0];

      return {
        totalTrips: stats._count.id,
        totalCountries: uniqueCountries.size,
        totalDays,
        longestTrip: longestTrip ? {
          id: longestTrip.id,
          name: longestTrip.name,
          days: longestTrip.metadata!.totalDays,
          country: longestTrip.metadata!.country
        } : null,
        shortestTrip: shortestTrip ? {
          id: shortestTrip.id,
          name: shortestTrip.name,
          days: shortestTrip.metadata!.totalDays,
          country: shortestTrip.metadata!.country
        } : null,
        mostVisitedCountry: mostVisitedEntry ? {
          country: mostVisitedEntry[0],
          visitCount: mostVisitedEntry[1]
        } : null
      };
    },
    tripsByUsername: async (_parent: any, { username }: { username: string }) => {
      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new GraphQLError('User not found');
      }

      return prisma.trip.findMany({
        where: { userId: user.id },
        include: {
          metadata: true, // Include metadata to get totalDays
        },
        orderBy: {
          startsOn: 'desc', // Order the trips by start date
        },
      });
    },
  },
  Mutation: {
    signInWithOtp: async (_parent: any, { email }: { email: string }, context: MyContext) => {
      const { error } = await context.supabase.auth.signInWithOtp({
        email: email,
        options: {
          // The URL the user will be redirected to after clicking the magic link.
          // Listed in Supabase project's auth settings.
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
        },
      });

      if (error) {
        throw new GraphQLError(error.message);
      }
      // We don't return tokens, just success. The client handles the session.
      return true;
    },
    updateUserProfile: async (_parent: any, args: any, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await prisma.user.update({
        where: { id: context.user.id },
        data: {
          username: args.username,
          fullName: args.fullName,
        },
      });
    },
    createTrip: async (_parent: any, { input }: { input: any }, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const { linkTree, destinationType, country, state, packingList, ...tripData } = input;

      const startsOn = new Date(tripData.startsOn);
      const endsOn = new Date(tripData.endsOn);
      const totalDays = Math.ceil((endsOn.getTime() - startsOn.getTime()) / (1000 * 60 * 60 * 24));

      let generatedPackingList;
      if (!packingList) {
        try {
          const prompt: string = buildPromptForLLM({
            destination: tripData.destination,
            totalDays: totalDays,
            tags: tripData?.tags,
            destinationType: destinationType
          });

          const payload = {
            contents: [{
              parts: [{ text: prompt }]
            }]
          };

          const geminiResponse = await fetch(
            `${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            }
          );

          if (geminiResponse.ok) {
            const result = await geminiResponse.json();
            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
              generatedPackingList = result.candidates[0].content.parts[0].text;
            }
          }
        } catch (error) {
          console.error("Failed to generate packing list from Gemini:", error);
        }
      }

      let coverImage = null;
      try {
        const searchQuery = `${tripData.destination} ${tripData?.tags.join(' ')} travel`;
        const result = await unsplashAPI.photos.getRandom({
          query: searchQuery,
          orientation: 'landscape',
        });

        if (result.type === 'success' && !Array.isArray(result.response)) {
          coverImage = result.response.urls.regular;
        } else {
          console.log('Error from Unsplash API');
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        console.log(error)
        console.log('Failed to fetch image from Unsplash');
      }

      const newTrip = await prisma.trip.create({
        data: {
          ...tripData,
          packingList: !packingList ? generatedPackingList : packingList,
          coverImage: coverImage,
          user: {
            connect: { id: context.user.id }
          },
          linkTree: {
            create: linkTree
          },
          metadata: {
            create: {
              country,
              state,
              totalDays,
              destinationType: destinationType || DestinationType.CITY, // Use input or default
            }
          }
        },
        include: {
          linkTree: true,
          metadata: true,
        }
      });

      return newTrip;
    },
    updateTrip: async (_parent: any, { id, input }: { id: string, input: any }, context: MyContext) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated', { extensions: { code: 'UNAUTHENTICATED' } });
      }

      const existingTrip = await prisma.trip.findUnique({ where: { id } });
      if (!existingTrip || existingTrip.userId !== context.user.id) {
        throw new GraphQLError('Trip not found or you are not authorized to edit it.', { extensions: { code: 'FORBIDDEN' } });
      }

      const { linkTree, destinationType, ...tripData } = input;

      const metadataUpdate: { destinationType?: string, totalDays?: number } = {};
      if (destinationType) {
        metadataUpdate.destinationType = destinationType;
      }

      const updatedTrip = await prisma.trip.update({
        where: { id },
        data: {
          ...tripData,
          linkTree: linkTree ? { update: linkTree } : undefined,
          metadata: Object.keys(metadataUpdate).length > 0 ? { update: metadataUpdate } : undefined,
        },
        include: {
          linkTree: true,
          metadata: true,
        },
      });

      return updatedTrip;
    }
  }
};
