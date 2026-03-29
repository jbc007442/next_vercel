import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    // ✅ Validate
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // ✅ Find OTP
    const record = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
      },
    });

    if (!record) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    // ✅ Check expiry
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // ✅ Mark OTP as used
    await prisma.otp.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    // ✅ Get user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Activate user (for signup case)
    if (!user.isActive) {
      await prisma.user.update({
        where: { email },
        data: { isActive: true },
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      message: 'Verification successful',
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
