import { NextResponse } from "next/server";
import { getSectionsByCourse } from "@/lib/data";

/**
 * Augments the global BigInt interface to include a toJSON method.
 * Needed for serializing BigInt values from Prisma via NextResponse.json().
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
 * Handles GET requests to fetch all sections for a specific course ID.
 * The course ID is provided as a dynamic segment in the URL path.
 * Example: /api/sections/CSE310
 *
 * @async
 * @export
 * @param {Request} request - The incoming Next.js request object (unused).
 * @param {object} context - Context object containing route parameters.
 * @param {object} context.params - Route parameters.
 * @param {string} context.params.courseID - The course ID from the URL path.
 * @returns {Promise<NextResponse>} A NextResponse object containing:
 * - An array of section objects in JSON format (status 200) if successful.
 * - An error message (status 500) if fetching fails.
 * The response includes Cache-Control headers.
 */
export async function GET(request: Request, { params }: { params: { courseID: string } }) {

    try {
        // Fetch sections using the cached data function
        const sections = await getSectionsByCourse(params.courseID);
        return NextResponse.json(sections, {
            headers: {
                // Cache sections data: public, 1 day max-age, 7 days stale-while-revalidate
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
              }
        });
    } catch (error) {
      // Log the error and return a generic server error response
      console.error(`Error fetching sections for courseID ${params.courseID}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }
  }