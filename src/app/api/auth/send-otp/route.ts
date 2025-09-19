import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Mode démo - simuler l'envoi d'OTP
    console.log(`Mode démo: Code OTP simulé envoyé au ${phoneNumber}`);
    
    return NextResponse.json({
      success: true,
      message: 'Code OTP envoyé (mode démo)',
      demo: true
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'OTP:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code OTP' },
      { status: 500 }
    );
  }
}