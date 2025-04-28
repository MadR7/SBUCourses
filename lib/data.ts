import { prisma } from "./prisma";
import { cache } from 'react'
import { z } from 'zod'
import { unstable_cache } from "next/cache";
import { type professors, type courses, type sections } from "@prisma/client"; // Import specific types

/**
 * @const courseQuerySchema
 * Zod schema for validating parameters used to query courses.
 * Defines optional filters for department, SBC, and a general search term.
 */
export const courseQuerySchema = z.object({
  /** An array of department codes (e.g., ["CSE", "AMS"]). Optional. */
  department: z.array(z.string()).optional(),
  /** An array of SBC codes (e.g., ["ARTS", "TECH"]). Optional. */
  sbc: z.array(z.string()).optional(),
  /** A search string to match against course number, title, description, or prerequisites. Optional. */
  search: z.string().optional(),
});

/**
 * Fetches a list of courses based on specified filter parameters.
 * Uses React's `cache` for request memoization within a single request lifecycle.
 *
 * @async
 * @function getCourses
 * @param {z.infer<typeof courseQuerySchema>} params - An object containing filter parameters validated by `courseQuerySchema`.
 * @param {string[]} [params.department] - Optional array of departments to filter by.
 * @param {string[]} [params.sbc] - Optional array of SBCs to filter by (requires all specified SBCs).
 * @param {string} [params.search] - Optional search term.
 * @returns {Promise<courses[]>} A promise that resolves to an array of course objects matching the filters, limited to 500 results. Sorted by relevance if search term provided, otherwise by course number.
 */
export const getCourses = cache(async (params: z.infer<typeof courseQuerySchema>): Promise<courses[]> => {
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
 * Uses React's `cache` for request memoization.
 *
 * @async
 * @function getSectionsByCourse
 * @param {string} course_id - The unique identifier (ID) of the course.
 * @returns {Promise<sections[]>} A promise that resolves to an array of section objects for the given course.
 */
export const getSectionsByCourse = cache(async(course_id: string): Promise<sections[]> =>{
  const sections = await prisma.sections.findMany({
    where: {
      course_id: course_id
    }
  });
  return sections;
})

/**
 * Fetches professor details by their exact name.
 * Uses React's `cache` for request memoization.
 *
 * @async
 * @function getProfessorByName
 * @param {string} name - The full name of the professor to search for.
 * @returns {Promise<professors | null>} A promise that resolves to the professor object if found, otherwise null. Logs errors to the console.
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
 * Fetches a unique, sorted list of all department codes present in the courses table.
 * Uses Next.js `unstable_cache` for data caching across requests with a revalidation period.
 *
 * @async
 * @function getDepartments
 * @param {string[]} [tags=['departments']] - Cache tags.
 * @param {object} [options={ revalidate: 86400 }] - Cache options (revalidates daily).
 * @returns {Promise<(string | null)[]>} A promise that resolves to an array of unique department codes.
 */
export const getDepartments = unstable_cache(
  async (): Promise<(string | null)[]> => {
    const courses = await prisma.courses.findMany({
      select: { Department: true },
      orderBy: { Department: 'asc' }
    });
    const departments = [...new Set(courses.flatMap(course => course.Department))];
    return departments;
  },
  ['departments'], // Cache tags
  { revalidate: 86400 } // Revalidate once per day (86400 seconds)
);

/**
 * Fetches a unique, sorted list of all SBC codes present in the courses table.
 * Uses Next.js `unstable_cache` for data caching across requests with a revalidation period.
 *
 * @async
 * @function getSBCs
 * @param {string[]} [tags=['sbcs']] - Cache tags.
 * @param {object} [options={ revalidate: 86400 }] - Cache options (revalidates daily).
 * @returns {Promise<string[]>} A promise that resolves to an array of unique SBC codes.
 */
export const getSBCs = unstable_cache(
  async (): Promise<string[]> => {
    const courses = await prisma.courses.findMany({
      select: { SBCs: true },
      orderBy: { SBCs: 'asc' }
    });
    const sbcs = [...new Set(courses.flatMap(course => course.SBCs))];
    return sbcs;
  },
  ['sbcs'], // Cache tags
  { revalidate: 86400 } // Revalidate once per day (86400 seconds)
);