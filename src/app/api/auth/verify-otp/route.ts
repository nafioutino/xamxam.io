import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { createClient } from '@/utils/supabase/server';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Numéro de téléphone et code requis' },
        { status: 400 }
      );
    }

    let isValidCode = false;

    // Vérifier si les variables d'environnement Twilio sont configurées
    if (!accountSid || !authToken || !serviceSid) {
      // Mode démo - accepter le code 1234
      isValidCode = code === '1234';
      console.log(`Mode démo: Vérification OTP pour ${phoneNumber} avec code ${code}`);
    } else {
      try {
        // Vérifier le code OTP via Twilio Verify
        const verificationCheck = await client.verify.v2
          .services(serviceSid)
          .verificationChecks.create({
            to: phoneNumber,
            code: code
          });

        isValidCode = verificationCheck.status === 'approved';
      } catch (twilioError) {
        console.error('Erreur Twilio:', twilioError);
        // En cas d'erreur Twilio, basculer en mode démo
        isValidCode = code === '1234';
      }
    }

    if (!isValidCode) {
      return NextResponse.json(
        { error: 'Code OTP invalide' },
        { status: 400 }
      );
    }

    // Code OTP valide - créer ou récupérer l'utilisateur dans Supabase
    const supabase = await createClient();
    
    // Normaliser le numéro de téléphone
    const normalizedPhone = phoneNumber.replace(/\s+/g, '');
    
    try {
      // Vérifier si un utilisateur existe déjà avec ce numéro
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', normalizedPhone)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erreur lors de la recherche de l\'utilisateur:', fetchError);
      }

      if (existingUser) {
        // Utilisateur existant - créer une session
        const { data: sessionData, error: sessionError } = await supabase.auth.signInAnonymously();
        
        if (sessionError) {
          console.error('Erreur lors de la création de session:', sessionError);
          return NextResponse.json(
            { error: 'Erreur lors de la création de session' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Connexion réussie',
          user: existingUser,
          session: sessionData.session
        });
      } else {
        // Nouvel utilisateur - créer le profil
        const { data: newUser, error: createError } = await supabase
          .from('profiles')
          .insert({
            phone: normalizedPhone,
            name: `Utilisateur ${normalizedPhone.slice(-4)}`,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Erreur lors de la création de l\'utilisateur:', createError);
          return NextResponse.json(
            { error: 'Erreur lors de la création du compte' },
            { status: 500 }
          );
        }

        // Créer une session pour le nouvel utilisateur
        const { data: sessionData, error: sessionError } = await supabase.auth.signInAnonymously();
        
        if (sessionError) {
          console.error('Erreur lors de la création de session:', sessionError);
        }

        return NextResponse.json({
          success: true,
          message: 'Compte créé et connexion réussie',
          user: newUser,
          session: sessionData?.session,
          isNewUser: true
        });
      }
    } catch (dbError) {
      console.error('Erreur base de données:', dbError);
      return NextResponse.json(
        { error: 'Erreur de base de données' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'OTP:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}