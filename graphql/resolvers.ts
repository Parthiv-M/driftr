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
    }
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

        if (result.type === 'success') {
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
