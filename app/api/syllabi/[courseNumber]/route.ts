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

    return NextResponse.json(syllabi);
  } catch (error) {
    console.error('Error fetching syllabi:', error);
    return NextResponse.json({ error: 'Failed to fetch syllabi' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 