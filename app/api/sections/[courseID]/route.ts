import { NextResponse } from "next/server";
import { getSectionsByCourse } from "@/lib/data";

/**
 * Global declaration merging to add a custom `toJSON` method to BigInt.
 * This is necessary because the default JSON.stringify method doesn't
 * know how to serialize BigInts, which might be returned by Prisma for section data.
 */
declare global {
    interface BigInt {
      toJSON(): string;
    }
  }

/**
 * Polyfill for BigInt serialization.
 * Adds a `toJSON` method to `BigInt.prototype` that converts the BigInt to its string representation.
 * This allows `NextResponse.json()` to correctly handle BigInt values potentially found in section data.
 */
BigInt.prototype.toJSON = function() {
    return this.toString();
};

/**
 * API route handler for GET requests to `/api/sections/[courseID]`.
 * Fetches all sections associated with a specific course ID.
 * 
 * Dynamic Route Parameter:
 * - `courseID` (string): The unique identifier for the course whose sections are to be fetched.
 * 
 * @param request - The incoming Next.js request object (unused in this handler).
 * @param params - An object containing the dynamic route parameters. Expected: { courseID: string }.
 * @returns A NextResponse object containing:
 *   - A JSON array of section objects on success.
 *   - A JSON error object with status 500 on failure.
 *   - Cache-Control headers for public caching (1 day max-age, 7 days stale-while-revalidate).
 */
export async function GET(request: Request, { params }: { params: { courseID: string } }) {

    try {
        const sections = await getSectionsByCourse(params.courseID);
        return NextResponse.json(sections, {
            headers: {
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
              }
        });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }
  }