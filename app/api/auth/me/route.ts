import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
    };

    // ✅ get user from DB
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.email.split('@')[0], // simple name
        avatar: '/avatars/default.png', // fallback
      },
    });
  } catch (error) {
    console.error('Me API Error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
