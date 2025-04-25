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
    // course_number is the primary key, so use findUnique
    const redditLinkData = await prisma.reddit_links.findUnique({
      where: {
        course_number: courseNumber,
      },
      select: {
        post_data: true, // Only select the data we need
      },
    });

    if (!redditLinkData || !redditLinkData.post_data) {
      // If no record or post_data is null/empty, return 404
      return NextResponse.json({ message: 'No Reddit links found for this course' }, { status: 404 });
    }

    // Return the post_data string. Frontend will parse it.
    return NextResponse.json({ post_data: redditLinkData.post_data });

  } catch (error) {
    console.error(`Error fetching Reddit links for ${courseNumber}:`, error);
    return NextResponse.json({ error: 'Failed to fetch Reddit links' }, { status: 500 });
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
} 