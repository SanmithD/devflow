import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from 'bcryptjs';
import { NextAuthOptions } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { NextRequest } from "next/server";
import { prisma } from "./db";
import { verifyToken } from "./jwt";

export const getCurrentUser = (req: NextRequest) => {
  try {

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return null;
    }

    return verifyToken(token as string);
  } catch (error) {
    console.log('middleware error', error);
    return null;
  }
}
const prismaAdapter = PrismaAdapter(prisma);

const toAdapterUser = (user: any): AdapterUser => ({
  ...user,
  id: String(user.id),
});

const adapter = {
  ...prismaAdapter,

  async createUser(data: any) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
        user_name: data.name ?? data.email?.split("@")[0],
        isVerified: true,
        isUserAllowed: true,
      },
    });
    return toAdapterUser(user);
  },

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    return user ? toAdapterUser(user) : null;
  },

  async updateUser(user: any) {
    const { id, ...data } = user;
    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });
    return toAdapterUser(updated);
  },

  async deleteUser(id: string) {
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });
    return toAdapterUser(user);
  },

  async linkAccount(data: any) {
    return prismaAdapter.linkAccount!({
      ...data,
      userId: Number(data.userId),
    }) as any;
  },

  async getUserByAccount({
    provider,
    providerAccountId,
  }: {
    provider: string;
    providerAccountId: string;
  }) {
    const account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
    return account?.user
      ? toAdapterUser(account.user)
      : null;
  },

  async getSessionAndUser(sessionToken: string) {
    const result = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });
    if (!result) return null;
    const { user, ...session } = result;
    return {
      session: { ...session, userId: String(session.userId) },
      user: toAdapterUser(user),
    };
  },

  async createSession(data: any) {
    const session = await prisma.session.create({
      data: { ...data, userId: Number(data.userId) },
    });
    return { ...session, userId: String(session.userId) };
  },

  async updateSession(data: any) {
    const session = await prismaAdapter.updateSession!(data);
    return session ? { ...session, userId: String(session.userId) } : null;
  },
};

export const authOptions: NextAuthOptions = {
  adapter: adapter,
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Missing Credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) throw new Error("User Not Found");
        if (!user.isVerified) throw new Error("Account is not verified");
        if (!user.isUserAllowed) throw new Error("Account is blocked");

        if (!user.password) {
          throw new Error(
            "This account was created using Google/GitHub Sign In"
          );
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) throw new Error("Invalid Credentials");

        return {
          id: user.id.toString(),
          name: user.user_name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id);
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}