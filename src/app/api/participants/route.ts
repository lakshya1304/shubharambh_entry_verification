import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'ALL'; // ALL, ENTERED, NOT_ENTERED, PAID, UNPAID
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { applicationNumber: { contains: search, mode: 'insensitive' } },
        { uid: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (filter === 'ENTERED') whereClause.entryStatus = 'ENTERED';
    if (filter === 'NOT_ENTERED') whereClause.entryStatus = 'NOT ENTERED';
    if (filter === 'PAID') whereClause.paymentStatus = 'Paid';
    if (filter === 'UNPAID') whereClause.paymentStatus = { not: 'Paid' };

    const total = await prisma.participant.count({ where: whereClause });
    const participants = await prisma.participant.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { registrationDate: 'desc' },
    });

    return NextResponse.json({ participants, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Participants GET error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {

    const body = await request.json();
    

    if (!body.applicationNumber && !body.uid) {
      return NextResponse.json({ message: 'Must provide either Application Number or UID' }, { status: 400 });
    }

    // Check uniqueness
    const existing = await prisma.participant.findFirst({
      where: {
        OR: [
          ...(body.applicationNumber ? [{ applicationNumber: body.applicationNumber }] : []),
          ...(body.uid ? [{ uid: body.uid }] : [])
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ message: 'Application Number or UID already exists' }, { status: 400 });
    }

    const participant = await prisma.participant.create({
      data: {
        name: body.name,
        applicationNumber: body.applicationNumber || null,
        uid: body.uid || null,
        email: body.email || null,
        department: body.department,
        semester: body.semester || null,
        phone: body.phone || null,
        amountPaid: parseFloat(body.amountPaid),
        paymentStatus: body.paymentStatus,
        entryStatus: 'NOT ENTERED'
      }
    });

    return NextResponse.json({ success: true, participant });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
