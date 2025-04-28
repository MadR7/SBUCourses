import { Suspense } from "react";
import { getCourses, getDepartments, getSBCs } from "@/lib/data";
import { CoursePage } from "./course-page";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Revalidation time for the page in seconds (30 days).
 * Enables Incremental Static Regeneration (ISR) for the home page.
 * @type {number}
 */
export const revalidate = 2592000;

/**
 * The main page component for the SBUCourses application.
 * This is an async server component that fetches initial data based on URL search parameters
 * and renders the main layout including the header, footer, and the core CoursePage component.
 *
 * @async
 * @export
 * @param {object} props - Component props.
 * @param {object} props.searchParams - URL search parameters.
 * @param {string} [props.searchParams.majors] - Comma-separated string of selected major/department codes.
 * @param {string} [props.searchParams.sbcs] - Comma-separated string of selected SBC codes.
 * @param {string} [props.searchParams.search] - Search query string for courses.
 * @returns {Promise<JSX.Element>} The rendered Home page component.
 */
export default async function Home({
    searchParams,
}:{
    searchParams: {majors?: string, sbcs?: string, search?: string}
}){
    // Parse selected majors/departments from URL query string
    const majorsSelected = (searchParams.majors?.split(",") || []).filter((major) => major !== null) as string[];
    // Parse selected SBCs from URL query string
    const sbcsSelected = (searchParams.sbcs?.split(",") || []).filter((sbc) => sbc !== null) as string[];
    // Get search query from URL query string
    const searchQuery = searchParams.search || "";

    // Fetch initial data concurrently: all departments, all SBCs, and courses filtered by search params
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
                            SBUCourses<span className="text-foreground">.</span>
                        </h1>
                        <span className="text-xs px-2 py-1 bg-card text-card-foreground rounded">Fall 2024</span>
                    </div>
                    <div className="flex items-center gap-2">
                    </div>
                </Link>
                <ThemeToggle />
            </header>
            <main className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Use Suspense for potential client-side loading within CoursePage */}
                <Suspense fallback={<div>Loading courses...</div>}>
                    <CoursePage initialCourses={courses} initialDepartments={departments} initialSBCs={sbcs} />
                </Suspense>
            </main>
            {/* Footer Section */}
            <footer className="px-6 py-4 border-t border-muted">
                <div className="flex flex-col items-center justify-center">
                <div>
                    <div className="text-sm">
                        {/* Credits and links to creators */}
                        <span>Made with ❤️ by </span>
                        <a className="underline" href="https://www.github.com/MadR7" target="_blank" rel="noopener noreferrer">Madhav Rapelli</a> and <a className="underline" href="https://www.github.com/thesgordon" target="_blank" rel="noopener noreferrer">Gordon Sun</a>
                    </div>
                </div>
                </div>
            </footer>
        </div>

    )
}