import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateOTP } from '@/lib/otp';
import { sendOTPEmail } from '@/lib/mail';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // ✅ Validate
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // ✅ Check user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'You are not registered. Please signup first.' },
        { status: 404 }
      );
    }

    // ✅ Check user is verified (important)
    if (!user.isActive) {
      return NextResponse.json({ error: 'Please verify your email first.' }, { status: 403 });
    }

    // ✅ Delete old OTPs
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
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      },
    });

    // ✅ Send OTP email
    await sendOTPEmail(email, otp);

    return NextResponse.json({
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
