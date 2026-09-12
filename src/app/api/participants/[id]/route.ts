import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    
    if (body.password !== 'Lakshya@2203') {
      return NextResponse.json({ message: 'Invalid deletion password' }, { status: 403 });
    }

    const { id } = await params;
    const participantId = parseInt(id);
    if (isNaN(participantId)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    await prisma.participant.delete({
      where: { id: participantId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Deletion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
