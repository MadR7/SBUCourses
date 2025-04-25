// app/api/professors/[name]/route.ts
import { NextResponse } from 'next/server';
import { getProfessorByName } from '@/lib/data'; // Import the existing data fetching function

/**
 * API route handler for GET requests to `/api/professors/[name]`.
 * Fetches a single professor's details using the name provided in the URL path.
 * 
 * Dynamic Route Parameter:
 * - `name` (string): The URL-encoded full name of the professor.
 * 
 * @param request - The incoming Next.js request object (unused in this handler).
 * @param params - An object containing the dynamic route parameters. Expected: { name: string }.
 * @returns A NextResponse object containing:
 *   - A JSON object of the professor on success.
 *   - A JSON error object with status 400 if the name is missing.
 *   - A JSON error object with status 404 if the professor is not found.
 *   - A JSON error object with status 500 on internal server error.
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