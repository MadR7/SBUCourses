import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { courseNumber: string } }
) {
  const courseNumber = params.courseNumber;

  if (!courseNumber) {
    return NextResponse.json({ error: 'Course number is required' }, { status: 400 });
  }

  try {
    const syllabi = await prisma.syllabi_links.findMany({
      where: {
        course_number: courseNumber,
      },
      select: {
        row_num: true,
        semester: true,
        professor: true,
        syllabus_link: true,
      },
      orderBy: [
        {
          semester: 'desc', // Optional: order by semester
        },
        {
          professor: 'asc', // Optional: then by professor
        },
      ],
    });

    if (!syllabi || syllabi.length === 0) {
      return NextResponse.json({ message: 'No syllabi found for this course' }, { status: 404 });
    }

    // Convert BigInt fields to strings before sending JSON response
    const serializableSyllabi = syllabi.map(syllabus => ({
      ...syllabus,
      row_num: syllabus.row_num.toString(), // Convert BigInt to string
    }));

    return NextResponse.json(serializableSyllabi);
  } catch (error: any) { // Added :any to catch error type issue
    // Check if the error is the BigInt serialization error, log specifically if needed
    if (error instanceof TypeError && error.message.includes('Do not know how to serialize a BigInt')) {
        console.error('Caught BigInt serialization error during JSON response preparation:', error);
        return NextResponse.json({ error: 'Failed to process data for response.' }, { status: 500 });
    }
    console.error('Error fetching syllabi:', error);
    return NextResponse.json({ error: 'Failed to fetch syllabi' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 