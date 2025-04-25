import { prisma } from "./prisma";
import { cache } from 'react'
import { z } from 'zod'
import { unstable_cache } from "next/cache";
import { professors } from "@prisma/client";

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
                { Course_Number: { contains: params.search, mode: 'insensitive' } },
                { Title: { contains: params.search, mode: 'insensitive' } },
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


export const getSectionsByCourse = cache(async(course_id: string)=>{
  const sections = await prisma.sections.findMany({
    where: {
      course_id: course_id
    }
  });
  return sections;
})

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