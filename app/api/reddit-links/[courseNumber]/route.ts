import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Initialize Prisma client directly for this route
const prisma = new PrismaClient();

/**
 * Handles GET requests to fetch stored Reddit post data for a specific course number.
 * The course number is provided as a dynamic segment in the URL path.
 * Example: /api/reddit-links/CSE310
 *
 * @async
 * @export
 * @param {Request} request - The incoming Next.js request object (unused).
 * @param {object} context - Context object containing route parameters.
 * @param {object} context.params - Route parameters.
 * @param {string} context.params.courseNumber - The course number from the URL path.
 * @returns {Promise<NextResponse>} A NextResponse object containing:
 * - A JSON object with the `post_data` field (string) if found (status 200).
 * - An error message (status 400) if the courseNumber parameter is missing.
 * - A message indicating no links found (status 404) if the record or `post_data` is missing.
 * - An error message (status 500) if a server error occurs during fetching.
 */
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