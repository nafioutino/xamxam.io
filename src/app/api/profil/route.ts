import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

// LIRE - Récupérer tous les profils
export async function GET(request: Request) {
  try {
    console.log('Récupération des profils...');
    const profiles = await prisma.profile.findMany({
      orderBy: { fullName: 'asc' }
    });
    
    console.log(`${profiles.length} profil(s) récupéré(s)`);
    return NextResponse.json({
      success: true,
      data: profiles,
      message: `${profiles.length} profil(s) trouvé(s)`
    }, { status: 200 });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des profils:', error);
    return NextResponse.json({
      success: false,
      error: 'Impossible de récupérer les profils',
      message: 'Une erreur est survenue lors de la récupération des données'
    }, { status: 500 });
  }
}

// AJOUTER - Créer un nouveau profil
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, fullName, avatarUrl } = body;

    // Validation des données
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si le profil existe déjà
    const existingProfile = await prisma.profile.findUnique({
      where: { id }
    });

    if (existingProfile) {
      return NextResponse.json({
        success: false,
        error: 'Profil existant',
        message: 'Un profil avec cet ID existe déjà'
      }, { status: 409 });
    }

    // Créer le nouveau profil
    const newProfile = await prisma.profile.create({
      data: { 
        id,
        fullName: fullName?.trim() || null,
        avatarUrl: avatarUrl?.trim() || null
      },
    });

    console.log('Nouveau profil créé:', newProfile.id);
    return NextResponse.json({
      success: true,
      data: newProfile,
      message: 'Profil créé avec succès'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Erreur lors de la création du profil:', error);
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Conflit de données',
        message: 'Ce profil existe déjà'
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de création',
      message: 'Impossible de créer le profil'
    }, { status: 500 });
  }
}

// MODIFIER - Mettre à jour un profil existant
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si le profil existe
    const existingProfile = await prisma.profile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      return NextResponse.json({
        success: false,
        error: 'Profil introuvable',
        message: 'Aucun profil trouvé avec cet ID'
      }, { status: 404 });
    }
    
    // Filtrer et nettoyer les données valides
    const validData: { fullName?: string | null; avatarUrl?: string | null } = {};
    if ('fullName' in data) {
      validData.fullName = data.fullName?.trim() || null;
    }
    if ('avatarUrl' in data) {
      validData.avatarUrl = data.avatarUrl?.trim() || null;
    }

    // Vérifier qu'il y a au moins une donnée à modifier
    if (Object.keys(validData).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Aucune modification',
        message: 'Aucune donnée valide à modifier'
      }, { status: 400 });
    }
    
    const updatedProfile = await prisma.profile.update({
      where: { id },
      data: validData,
    });

    console.log('Profil mis à jour:', updatedProfile.id);
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profil mis à jour avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Profil introuvable',
        message: 'Le profil à modifier n\'existe pas'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de modification',
      message: 'Impossible de modifier le profil'
    }, { status: 500 });
  }
}

// SUPPRIMER - Supprimer un profil
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id || typeof id !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Données invalides',
        message: 'L\'ID est requis et doit être une chaîne de caractères (UUID)'
      }, { status: 400 });
    }

    // Vérifier si le profil existe avant de le supprimer
    const existingProfile = await prisma.profile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      return NextResponse.json({
        success: false,
        error: 'Profil introuvable',
        message: 'Aucun profil trouvé avec cet ID'
      }, { status: 404 });
    }
    
    const deletedProfile = await prisma.profile.delete({
      where: { id },
    });

    console.log('Profil supprimé:', deletedProfile.id);
    return NextResponse.json({
      success: true,
      data: deletedProfile,
      message: 'Profil supprimé avec succès'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Erreur lors de la suppression du profil:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'Profil introuvable',
        message: 'Le profil à supprimer n\'existe pas'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Erreur de suppression',
      message: 'Impossible de supprimer le profil'
    }, { status: 500 });
  }
}