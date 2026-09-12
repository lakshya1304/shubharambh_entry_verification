import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function POST(request: Request) {
  try {

    const { identifier } = await request.json(); // could be uid or applicationNumber

    if (!identifier) {
      return NextResponse.json({ message: 'Identifier is required' }, { status: 400 });
    }

    // Attempt to find the participant
    const participant = await prisma.participant.findFirst({
      where: {
        OR: [
          { uid: identifier },
          { applicationNumber: identifier }
        ]
      }
    });

    if (!participant) {
      return NextResponse.json({ 
        status: 'NOT_FOUND', 
        message: 'Student not found.' 
      }, { status: 404 });
    }

    if (participant.entryStatus === 'ENTERED') {
      return NextResponse.json({ 
        status: 'DUPLICATE', 
        message: 'Entry already used.',
        participant 
      }, { status: 200 }); // Status 200 because the request succeeded in finding the state, but we return a DUPLICATE status in the body
    }

    // Atomic update to ensure no race conditions
    // We update WHERE id is participant.id AND entryStatus is NOT ENTERED
    const updatedParticipant = await prisma.participant.updateMany({
      where: {
        id: participant.id,
        entryStatus: 'NOT ENTERED'
      },
      data: {
        entryStatus: 'ENTERED',
        entryTimestamp: new Date()
      }
    });

    if (updatedParticipant.count === 0) {
      // If count is 0, it means another request already updated it to ENTERED just milliseconds ago
      const reFetched = await prisma.participant.findUnique({ where: { id: participant.id }});
      return NextResponse.json({ 
        status: 'DUPLICATE', 
        message: 'Entry already used.',
        participant: reFetched 
      }, { status: 200 });
    }

    const finalParticipant = await prisma.participant.findUnique({ where: { id: participant.id }});

    return NextResponse.json({ 
      status: 'VERIFIED', 
      message: 'Entry verified successfully.',
      participant: finalParticipant 
    }, { status: 200 });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
