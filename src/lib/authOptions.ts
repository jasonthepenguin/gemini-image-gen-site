import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { DefaultSession } from "next-auth";

export const authOptions: AuthOptions = {
  // Use the Prisma Adapter
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  // Use database sessions
  session: {
    strategy: "database",
  },
  // Add callbacks to include user ID and credits in the session
  callbacks: {
    // Corrected session callback for database strategy
    async session({ session, user }) { // Changed token to user
      // The user object here comes from the session database record
      if (user && session.user) {
        session.user.id = user.id; // Use user.id directly

        // Fetch the LATEST user data (including credits) from the main User table
        // as the 'user' object passed to the callback might not be the most up-to-date
        // regarding fields like 'credits' which can change frequently.
        const latestUserData = await prisma.user.findUnique({
          where: { id: user.id },
          select: { credits: true }
        });

        session.user.credits = latestUserData?.credits ?? 0; // Assign fetched credits

        console.log("Session callback (DB strategy): user ID =", user.id, "credits =", latestUserData?.credits);
      }
      return session;
    },
  },
  // Add event to set initial credits for new users
  events: {
    async createUser({ user }) {
      // Give 1 free credit on sign up
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: 1 },
      });
      console.log(`User ${user.id} created, 1 credit added.`);
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Add custom fields to NextAuth Session/User types
declare module "next-auth" {
  interface Session {
    user?: {
      id?: string | null; // Add id
      credits?: number | null; // Add credits
    } & DefaultSession["user"];
  }
    interface User {
        credits?: number | null; // Add credits to User model type
    }
}
