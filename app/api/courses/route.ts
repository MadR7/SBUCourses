import { NextResponse } from "next/server";
import { getCourses } from "@/lib/data";

/**
 * Augments the global BigInt interface to include a toJSON method.
 * This is necessary for proper serialization of BigInt values (often used for IDs in Prisma)
 * when using NextResponse.json().
 */
declare global {
    interface BigInt {
      /**
       * Converts a BigInt value to its string representation for JSON serialization.
       * @returns {string} The string representation of the BigInt.
       */
      toJSON(): string;
    }
  }

/**
 * Polyfill for BigInt.prototype.toJSON.
 * Ensures BigInt values are serialized as strings in JSON responses.
 * @returns {string} The string representation of the BigInt.
 */
BigInt.prototype.toJSON = function() {
    return this.toString();
};

/**
 * Handles GET requests to fetch courses.
 * Retrieves courses based on optional query parameters: 'sbc', 'department', and 'search'.
 * Applies caching headers to the response.
 *
 * @async
 * @export
 * @param {Request} request - The incoming Next.js request object.
 * @returns {Promise<NextResponse>} A NextResponse containing the list of courses in JSON format,
 * or a JSON error object with status 500 if fetching fails.
 * Response includes Cache-Control headers for client-side and CDN caching.
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