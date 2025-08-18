// import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
// import { Adapter } from "next-auth/adapters";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import bcrypt from "bcryptjs";

// Étendre le type User de next-auth pour inclure l'id
declare module "next-auth" {
  interface User {
    id: string;
  }
  interface Session {
    user: User;
  }
}

// import { db } from "@/lib/db";

// Désactivation temporaire de l'authentification pour permettre l'accès sans base de données
export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    // Tous les providers sont temporairement désactivés
  ],
  // Fonction factice pour simuler l'authentification
  callbacks: {
    async session({ session }) {
      // Simuler un utilisateur authentifié
      if (session?.user) {
        session.user.id = "user-123";
        session.user.name = "Utilisateur Test";
        session.user.email = "test@example.com";
        session.user.image = "https://ui-avatars.com/api/?name=Test+User&background=random";
      }
      return session;
    },
    async jwt({ token }) {
      // Simuler un token JWT
      return {
        ...token,
        id: "user-123",
        name: "Utilisateur Test",
        email: "test@example.com",
        picture: "https://ui-avatars.com/api/?name=Test+User&background=random"
      };
    }
  }
};

// Le code suivant est commenté pour éviter les erreurs de syntaxe
/*
// Handle phone + OTP login
if (credentials?.phone && credentials?.otp) {
  // In a real app, verify OTP with Twilio or similar service
  // For MVP, we'll just check if OTP is "1234" (demo purposes only)
  if (credentials.otp !== "1234") {
    throw new Error("Invalid OTP");
  }

  const user = await db.user.findUnique({
    where: {
      phone: credentials.phone,
    },
  });

  // Create user if not exists
  if (!user) {
    const newUser = await db.user.create({
      data: {
        phone: credentials.phone,
        name: "User", // Default name
      },
    });
    return newUser;
  }

  return user;
}

// Handle email + password login
if (credentials?.email && credentials?.password) {
  const user = await db.user.findUnique({
    where: {
      email: credentials.email,
    },
  });

  if (!user || !user.password) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  return user;
}
*/