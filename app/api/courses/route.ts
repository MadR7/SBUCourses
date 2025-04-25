import { NextResponse } from "next/server";
import { getCourses } from "@/lib/data";

/**
 * Global declaration merging to add a custom `toJSON` method to BigInt.
 * This is necessary because the default JSON.stringify method doesn't
 * know how to serialize BigInts, which might be returned by Prisma.
 */
declare global {
    interface BigInt {
      toJSON(): string;
    }
  }

/**
 * Polyfill for BigInt serialization.
 * Adds a `toJSON` method to `BigInt.prototype` that converts the BigInt to its string representation.
 * This allows `NextResponse.json()` to correctly handle BigInt values.
 */
BigInt.prototype.toJSON = function() {
    return this.toString();
};

/**
 * API route handler for GET requests to `/api/courses`.
 * Fetches courses based on query parameters like 'sbc', 'department', and 'search'.
 * 
 * Query Parameters:
 * - `sbc` (string[] | undefined): Filters courses by SBC requirements. Can be provided multiple times.
 * - `department` (string[] | undefined): Filters courses by department. Can be provided multiple times.
 * - `search` (string | undefined): A general search term to filter courses.
 * 
 * @param request - The incoming Next.js request object.
 * @returns A NextResponse object containing:
 *   - A JSON array of course objects on success.
 *   - A JSON error object with status 500 on failure.
 *   - Cache-Control headers for public caching (1 day max-age, 7 days stale-while-revalidate).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sbcs = searchParams.getAll('sbc')
  const departments = searchParams.getAll('department')
  const search = searchParams.get('search') || undefined;
  try {
    const courses = await getCourses({sbc:sbcs, department: departments, search: search});
    return NextResponse.json(courses, {
      headers: {
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
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