import { prisma } from "./prisma";
import { cache } from 'react'
import { z } from 'zod'
import { unstable_cache } from "next/cache";
import { professors } from "@prisma/client";

/**
 * Zod schema for validating course query parameters.
 * - `department`: Optional array of department codes.
 * - `sbc`: Optional array of SBC codes.
 * - `search`: Optional search string.
 */
export const courseQuerySchema = z.object({
  department: z.array(z.string()).optional(),
  sbc: z.array(z.string()).optional(),
  search: z.string().optional(),
});

/**
 * Fetches courses from the database based on provided filters.
 * Uses React `cache` for request-level memoization.
 * 
 * @param params - An object containing optional filters:
 *   - `department`: Array of department codes to filter by.
 *   - `sbc`: Array of SBC codes. Courses must satisfy all specified SBCs.
 *   - `search`: A search string to match against course number, title, description, or prerequisites (case-insensitive).
 * @returns A promise that resolves to an array of course objects matching the criteria, limited to 500 results.
 *          Sorted by relevance (if search term provided) then course number, or just by course number.
 */
export const getCourses = cache(async (params: z.infer<typeof courseQuerySchema>) => {
  const courses = await prisma.courses.findMany({
    where: {
      AND: [
        params.department && params.department.length > 0 
          ? { Department: {in: params.department}} 
          : {},
        params.sbc && params.sbc.length > 0 
          ? { SBCs: { hasEvery: params.sbc } } 
          : {},
        params.search 
          ? {
              OR: [
                { Course_Number: { contains: params.search, mode: 'insensitive' } },
                { Title: { contains: params.search, mode: 'insensitive' } },
                { Description: { contains: params.search, mode: 'insensitive' } },
                { Prerequisites: { contains: params.search, mode: 'insensitive' } },
                
              ]
            } 
          : {}
      ]
    },
    orderBy: params.search?[
      {
        _relevance:{
          fields:["Course_Number"],
          search: params.search.split(" ").join(","),
          sort: 'desc'
        }
      },
      { Course_Number: 'asc' }
    ] : {
      Course_Number: 'asc'
    },
    take: 500,
  });
  
  return courses;
});

/**
 * Fetches all sections associated with a specific course ID.
 * Uses React `cache` for request-level memoization.
 * 
 * @param course_id - The unique identifier for the course.
 * @returns A promise that resolves to an array of section objects for the given course.
 */
export const getSectionsByCourse = cache(async(course_id: string)=>{
  const sections = await prisma.sections.findMany({
    where: {
      course_id: course_id
    }
  });
  return sections;
})

/**
 * Fetches a professor's details from the database by their name.
 * Uses React `cache` for request-level memoization.
 * 
 * @param name - The full name of the professor to search for.
 * @returns A promise that resolves to the professor object if found, otherwise null.
 */
export const getProfessorByName = cache(async (name: string): Promise<professors | null> => {
  if (!name) {
    return null;
  }
  try {
    const professor = await prisma.professors.findFirst({
      where: {
        name: name,
      },
    });
    return professor;
  } catch (error) {
    console.error(`Error fetching professor ${name}:`, error);
    return null;
  }
});

/**
 * Fetches a unique, sorted list of all department codes from the courses table.
 * Uses Next.js `unstable_cache` for data caching with a revalidation period of 1 day (86400 seconds).
 * Cache tagged with 'departments'.
 * 
 * @returns A promise that resolves to an array of unique department strings.
 */
export const getDepartments = unstable_cache(
  async () => {
    const courses = await prisma.courses.findMany({
      select: { Department: true },
      orderBy: { Department: 'asc' }
    });
    const departments = [...new Set(courses.flatMap(course => course.Department))];
    return departments;
  },
  ['departments'],
  { revalidate: 86400 }
);

/**
 * Fetches a unique, sorted list of all SBC (Stony Brook Curriculum) codes from the courses table.
 * Uses Next.js `unstable_cache` for data caching with a revalidation period of 1 day (86400 seconds).
 * Cache tagged with 'sbcs'.
 * 
 * @returns A promise that resolves to an array of unique SBC strings.
 */
export const getSBCs = unstable_cache(
  async () => {
    const courses = await prisma.courses.findMany({
      select: { SBCs: true },
      orderBy: { SBCs: 'asc' }
    });
    const sbcs = [...new Set(courses.flatMap(course => course.SBCs))];
    return sbcs;
  },
  ['sbcs'],
  { revalidate: 86400 }
);