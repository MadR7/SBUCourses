import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API route handler for GET requests to `/api/professor`.
 * Fetches a single professor's details based on their exact name.
 * 
 * Query Parameters:
 * - `name` (string, required): The full name of the professor to search for.
 * 
 * @param request - The incoming Next.js request object.
 * @returns A NextResponse object containing:
 *   - A JSON object of the professor if found (or null if not found) on success.
 *   - A JSON error object with status 400 if the 'name' parameter is missing.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Name parameter is required' }, { status: 400 });
  }

  const professor = await prisma.professors.findFirst({
    where: {
      name: name
    }
  });

  return NextResponse.json(professor);
}
