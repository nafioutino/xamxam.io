import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// LIRE
export async function GET(request: Request) {
  try {
    const profiles = await prisma.profile.findMany();
    return NextResponse.json(profiles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

// AJOUTER
// AJOUTER
export async function POST(request: Request) {
  try {
    const { firstName, lastName, email, position } = await request.json();

    // Vérifier que l'email est une chaîne de caractères valide
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required and must be a string' }, { status: 400 });
    }

    // Créer un nouvel employé avec Prisma
    const newprofile = await prisma.profile.create({
      data: { fullName, avatarUrl},
    });

    // Retourner la réponse avec le nouvel employé créé
    return NextResponse.json(newprofile, { status: 201 });
  } catch (error) {
    console.error('Failed to create profile:', error);
    // Retourner une réponse d'erreur avec un statut 500 en cas d'échec
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}


// MODIFIER
export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json();
    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID is required and must be a number' }, { status: 400 });
    }
    const updatedprofile = await prisma.profile.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedprofile, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// SUPPRIMER
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'number') {
      return NextResponse.json({ error: 'ID is required and must be a number' }, { status: 400 });
    }
    const deletedprofile = await prisma.profile.delete({
      where: { id },
    });
    return NextResponse.json(deletedprofile, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}