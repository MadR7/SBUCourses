import { NextResponse } from "next/server";
import { getCourses } from "@/lib/data";
declare global {
    interface BigInt {
      toJSON(): string;
    }
  }

BigInt.prototype.toJSON = function() {
    return this.toString();
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sbcs = searchParams.getAll('sbc')
  const departments = searchParams.getAll('department')
  const search = searchParams.get('search') || undefined;
  try {
    const courses = await getCourses({sbc:sbcs, department: departments, search: search});
    return NextResponse.json(courses, {
      headers: {
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}