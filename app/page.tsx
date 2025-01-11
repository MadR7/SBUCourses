import { Suspense } from "react";
import { getDepartments, getSBCs } from "@/lib/data";
import { CoursePage } from "./course-page";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";


export const revalidate = 2592000;

export default async function Home(){
    const departments = await getDepartments();
    const sbcs = await getSBCs();
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="px-6 py-4 flex items-center justify-between border-b border-muted">
                <Link href="/">
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
                    <CoursePage initialDepartments={departments} initialSBCs={sbcs} />
                </Suspense>
            </main>
        </div>
        
    )
}