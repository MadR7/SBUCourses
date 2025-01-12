import { prisma } from "./prisma";
import { cache } from 'react'
import { z } from 'zod'
import { unstable_cache } from "next/cache";
export const courseQuerySchema = z.object({
  department: z.array(z.string()).optional(),
  sbc: z.array(z.string()).optional(),
  search: z.string().optional(),
});

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
                { Title: { contains: params.search, mode: 'insensitive' } },
                { Course_Number: { contains: params.search, mode: 'insensitive' } },
                { Description: { contains: params.search, mode: 'insensitive' } },
              ]
            } 
          : {}
      ]
    }, 
    take: 500
  });
  
  return courses;
});

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