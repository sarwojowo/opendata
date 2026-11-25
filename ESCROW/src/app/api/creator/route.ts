import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getUserByWallet } from '@/lib/user';
import { serializeBigInt } from '@/lib/serializer';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.wallet) {
            return NextResponse.json(
                { error: 'Unauthorized. Please login first.' },
                { status: 401 }
            );
        }

        const { phoneNumber } = await request.json();

        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return NextResponse.json(
                { error: 'Phone number is required' },
                { status: 400 }
            );
        }

        // Get user from wallet
        const user = await getUserByWallet(session.user.wallet.toLowerCase());
        
        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user already has a creator profile
        const existingCreator = await prisma.creator.findFirst({
            where: {
                user_id: user.id,
                deleted_at: null
            }
        });

        if (existingCreator) {
            return NextResponse.json(
                { error: 'You are already registered as an artist' },
                { status: 400 }
            );
        }

        // Create creator profile
        const creator = await prisma.creator.create({
            data: {
                user_id: user.id,
                phone_number: phoneNumber.trim()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully registered as an artist',
            data: serializeBigInt(creator)
        });
    } catch (error) {
        console.error('Error creating creator:', error);
        return NextResponse.json(
            { error: 'Failed to register as artist. Please try again.' },
            { status: 500 }
        );
    }
}
