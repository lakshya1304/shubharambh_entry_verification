import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const p1 = await prisma.participant.upsert({
    where: { applicationNumber: 'APP1001' },
    update: {},
    create: {
      name: 'Rahul Kumar',
      applicationNumber: 'APP1001',
      uid: 'ICFAI1001',
      email: 'rahul@example.com',
      department: 'BTech',
      semester: '1st',
      phone: '9876543210',
      amountPaid: 500,
      paymentStatus: 'Paid',
      entryStatus: 'NOT ENTERED',
    }
  })
  
  const p2 = await prisma.participant.upsert({
    where: { applicationNumber: 'APP1002' },
    update: {},
    create: {
      name: 'Ananya Singh',
      applicationNumber: 'APP1002',
      uid: 'ICFAI1002',
      email: 'ananya@example.com',
      department: 'BCA',
      semester: '1st',
      phone: '9876543211',
      amountPaid: 500,
      paymentStatus: 'Paid',
      entryStatus: 'ENTERED',
      entryTimestamp: new Date()
    }
  })
  
  console.log({ p1, p2 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
