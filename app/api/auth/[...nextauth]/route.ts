import { prisma } from '@/app/src/lib/db';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
    adapter: PrismaAdapter(prisma),

    // authentication provides
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
        }),

        // login with email and password
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {}
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Missing Credentials")
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user) {
                    throw new Error("User Not Found")
                }

                if (!user.isVerified) {
                    throw new Error("Account is not verified")
                }

                if (!user.isUserAllowed) {
                    throw new Error("Account is blocked")
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new Error("Invalid Credntials")
                }

                return {
                    id: user.id.toString(),
                    name: user.user_name,
                    email: user.email,
                    role: user.role
                }
            }
        })
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            return token
        },

        async session({ session, token }: { session: any; token: any }) {
            if (token.sub && session.user) {
                session.user.id = token?.id;
                session.user.role = token?.role;
            }
            return session
        }
    },

    secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
