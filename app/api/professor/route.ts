import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Handles GET requests to fetch a single professor by their exact name.
 * Expects a 'name' query parameter.
 *
 * @async
 * @export
 * @param {Request} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A NextResponse containing the professor object in JSON format if found,
 * or a JSON error object with status 400 if the 'name' parameter is missing,
 * or potentially null if the professor is not found (Prisma `findFirst` behavior).
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
