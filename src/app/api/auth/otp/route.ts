import { NextRequest, NextResponse } from "next/server";
import { Twilio } from "twilio";

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

// For MVP, we'll use a simple in-memory store for OTPs
// In production, use Redis or similar for better security and scalability
const otpStore: Record<string, { otp: string; expires: number }> = {};

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Generate a 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP with 5-minute expiration
    otpStore[phone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    // In production, send OTP via Twilio
    if (process.env.NODE_ENV === "production" && accountSid && authToken && twilioPhone) {
      const client = new Twilio(accountSid, authToken);
      await client.messages.create({
        body: `Votre code de vérification XAMXAM est: ${otp}`,
        from: twilioPhone,
        to: phone,
      });
    } else {
      // For development, just log the OTP
      console.log(`OTP for ${phone}: ${otp}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("OTP error:", error);
    return NextResponse.json(
      { error: "Failed to send OTP" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const storedData = otpStore[phone];
    
    if (!storedData || Date.now() > storedData.expires) {
      return NextResponse.json(
        { error: "OTP expired or invalid" },
        { status: 400 }
      );
    }

    if (storedData.otp !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Clear the OTP after successful verification
    delete otpStore[phone];

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}