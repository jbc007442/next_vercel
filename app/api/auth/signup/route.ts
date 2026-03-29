import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // ✅ Validate email
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ✅ Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists. Please login.' }, { status: 400 });
    }

    // ✅ Create user (inactive by default)
    const user = await prisma.user.create({
      data: {
        email,
        isActive: false, // 👈 important
      },
    });

    // ✅ Delete old OTPs (avoid spam/confusion)
    await prisma.otp.deleteMany({
      where: {
        email,
        isUsed: false,
      },
    });

    // ✅ Generate OTP
    const otp = generateOTP();

    // ✅ Save OTP
    await prisma.otp.create({
      data: {
        email,
        otp,
        isUsed: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // ✅ Send OTP email
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      message: 'Signup successful. OTP sent to your email.',
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Signup failed. Please try again.' }, { status: 500 });
  }
}
