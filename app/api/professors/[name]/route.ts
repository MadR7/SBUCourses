// app/api/professors/[name]/route.ts
import { NextResponse } from 'next/server';
import { getProfessorByName } from '@/lib/data'; // Import the existing data fetching function

/**
 * Handles GET requests for a specific professor by name provided in the URL path.
 * Example: /api/professors/Jane%20Doe
 *
 * @async
 * @export
 * @param {Request} request - The incoming Next.js request object (unused in this handler).
 * @param {object} context - The context object containing route parameters.
 * @param {object} context.params - The route parameters.
 * @param {string} context.params.name - The URL-encoded name of the professor from the dynamic segment.
 * @returns {Promise<NextResponse>} A NextResponse object containing:
 * - The professor's data in JSON format (status 200) if found.
 * - An error message (status 400) if the name parameter is invalid.
 * - An error message (status 404) if the professor is not found.
 * - An error message (status 500) if there's a server error during data fetching.
 */
export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const name = decodeURIComponent(params.name); // Decode the name from the URL

  if (!name) {
    return NextResponse.json({ error: 'Professor name is required' }, { status: 400 });
  }

  try {
    const professor = await getProfessorByName(name);
    if (!professor) {
      return NextResponse.json({ error: 'Professor not found' }, { status: 404 });
    }
    return NextResponse.json(professor);
  } catch (error) {
    console.error(`Error fetching professor ${name}:`, error);
    return NextResponse.json({ error: 'Failed to fetch professor data' }, { status: 500 });
  }
}