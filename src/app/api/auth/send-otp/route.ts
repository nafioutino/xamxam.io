import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !serviceSid) {
  console.error('Variables d\'environnement Twilio manquantes');
}

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    // Vérifier si les variables d'environnement Twilio sont configurées
    if (!accountSid || !authToken || !serviceSid) {
      // Mode démo - simuler l'envoi d'OTP
      console.log(`Mode démo: Code OTP simulé envoyé au ${phoneNumber}`);
      return NextResponse.json({
        success: true,
        message: 'Code OTP envoyé (mode démo)',
        demo: true
      });
    }

    // Envoyer le code OTP via Twilio Verify
    const verification = await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms',
        locale: 'fr'
      });

    if (verification.status === 'pending') {
      return NextResponse.json({
        success: true,
        message: 'Code OTP envoyé avec succès',
        sid: verification.sid
      });
    } else {
      return NextResponse.json(
        { error: 'Échec de l\'envoi du code OTP' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'OTP:', error);
    
    // En cas d'erreur Twilio, basculer en mode démo
    return NextResponse.json({
      success: true,
      message: 'Code OTP envoyé (mode démo - erreur Twilio)',
      demo: true,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}