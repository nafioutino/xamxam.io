import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { db } from "@/lib/db";

// Définition du type User pour TypeScript
type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
};

// Implémentation simulée de la base de données puisque db est un objet vide
const mockDb = {
  user: {
    findUnique: async ({ where }: { where: { email: string } }): Promise<User | null> => {
      console.log('Recherche utilisateur avec email:', where.email);
      return null; // Simuler qu'aucun utilisateur n'existe
    },
    create: async ({ data }: { data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> }): Promise<User> => {
      console.log('Création utilisateur:', data);
      return {
        id: 'user-' + Date.now(),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }
};

// Remplacer db par mockDb
const userDb = (db as any).user || mockDb.user;

const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { name, email, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await userDb.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userDb.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    );
  }
}