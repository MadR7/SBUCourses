// app/api/professors/[name]/route.ts
import { NextResponse } from 'next/server';
import { getProfessorByName } from '@/lib/data'; // Import the existing data fetching function

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