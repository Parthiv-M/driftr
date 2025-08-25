import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { typeDefs } from '@graphql/schema';
import { resolvers } from '@graphql/resolvers';
import prisma from '@lib/prisma';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server'; // Import NextRequest

export interface MyContext {
  user?: User;
  prisma: PrismaClient;
  supabase: SupabaseClient;
}

const server = new ApolloServer<MyContext>({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    // The res object is not available in the App Router context.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        global: {
          // Use req.headers.get() for the standard Request object
          headers: { Authorization: req?.headers?.get('authorization') || '' },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    return {
      req,
      user: user ?? undefined,
      prisma,
      supabase,
    };
  },
});

export { handler as GET, handler as POST };