import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Votre logique middleware
      return !!auth?.user;
    },
  },
  providers: [], // Ajoutez vos providers ici s'ils n'utilisent pas Node.js
} satisfies NextAuthConfig;
