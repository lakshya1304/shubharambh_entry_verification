import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function GET() {
  try {
    const participants = await prisma.participant.findMany();
    
    const totalParticipants = participants.length;
    let totalMoneyCollected = 0;
    let entriesCompleted = 0;

    for (const p of participants) {
      if (p.paymentStatus.toLowerCase() === 'paid') {
        totalMoneyCollected += p.amountPaid;
      }
      if (p.entryStatus === 'ENTERED') {
        entriesCompleted++;
      }
    }

    const remaining = totalParticipants - entriesCompleted;

    const recentEntries = await prisma.participant.findMany({
      where: { entryStatus: 'ENTERED' },
      orderBy: { entryTimestamp: 'desc' },
      take: 5
    });

    return NextResponse.json({
      totalParticipants,
      totalMoneyCollected,
      entriesCompleted,
      remaining,
      recentEntries
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
