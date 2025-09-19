import { NextRequest, NextResponse } from "next/server";

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

    // For development, just log the OTP
    console.log(`OTP for ${phone}: ${otp}`);

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