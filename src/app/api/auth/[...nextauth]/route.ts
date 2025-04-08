import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { AuthOptions } from "next-auth"

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here if needed
  ],
  // Optional: Add custom pages, callbacks, etc.
  // pages: {
  //   signIn: '/auth/signin', // Example custom sign-in page
  // }
  // secret: process.env.NEXTAUTH_SECRET, // Already inferred, but can be explicit
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
