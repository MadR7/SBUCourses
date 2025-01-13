import { NextResponse } from "next/server";
import { getSectionsByCourse } from "@/lib/data";
declare global {
    interface BigInt {
      toJSON(): string;
    }
  }

BigInt.prototype.toJSON = function() {
    return this.toString();
};

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
  