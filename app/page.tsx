import { Suspense } from "react";
import { getCourses, getDepartments, getSBCs } from "@/lib/data";
import { CoursePage } from "./course-page";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";


export const revalidate = 2592000;

export default async function Home({
    searchParams,
}:{
    searchParams: {majors?: string, sbcs?: string, search?: string}
}){

    const majorsSelected = (searchParams.majors?.split(",") || []).filter((major) => major !== null) as string[];
    const sbcsSelected = (searchParams.sbcs?.split(",") || []).filter((sbc) => sbc !== null) as string[];
    const searchQuery = searchParams.search || "";

    
    const [departments, sbcs, courses] = await Promise.all([
        getDepartments(),
        getSBCs(),
        getCourses({sbc: sbcsSelected, department: majorsSelected, search: searchQuery})
    ]);
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="px-6 py-4 flex items-center justify-between border-b border-muted">
                <Link 
                    href={{
                        pathname: '/',
                    }}
                >
                    <div className="flex items-center gap-3 cursor-pointer">
                        <h1 className="text-[rgb(var(--sbu-red))] text-2xl font-bold">
                            SBUScheduler<span className="text-foreground">.</span>
                        </h1>
                        <span className="text-xs px-2 py-1 bg-card text-card-foreground rounded">Fall 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                </Link>
                <ThemeToggle />
            </header>
            <main className="container mx-auto px-4 py-6 max-w-7xl">
                <Suspense fallback={<div>Loading...</div>}>
                    <CoursePage initialCourses={courses} initialDepartments={departments} initialSBCs={sbcs} />
                </Suspense>
            </main>
            <footer className="px-6 py-4 border-t border-muted">
                <div className="flex flex-col items-center justify-center">
                <div>
                    <div className="text-sm">
                        <span>Made with ❤️ by </span>
                        <a className="underline" href="https://www.github.com/MadR7" target="_blank" rel="noopener noreferrer">Madhav Rapelli</a> and <a className="underline" href="https://www.github.com/thesgordon" target="_blank" rel="noopener noreferrer">Gordon Sun</a>
                    </div>
                </div>
                </div>
            </footer>
        </div>
        
    )
}