"use client"

import React from "react"
import {useSearchParams} from "next/navigation"
import { useEffect } from "react"

interface FilterScreenProps {
    filterScreen: boolean;
    setFilterScreen: React.Dispatch<React.SetStateAction<boolean>>;
    initialDepartments: (string | null)[];
    initialSBCs: string[];
    setMajorsSelected: (majors: string[]) => void;
    setSBCSelected: (sbcs: string[]) => void;
}

export default function FilterScreen(
    {filterScreen, setFilterScreen, initialDepartments, initialSBCs, setMajorsSelected, setSBCSelected}: FilterScreenProps
){
    const searchParams = useSearchParams();
    let selectedMajors = searchParams.get("majors")?.split(",") || []
    let selectedSBCs = searchParams.get("sbcs")?.split(",") || []
    const handleFilterClose = () =>{
        setFilterScreen(false)
    }

    const handleSBCClick = (sbc: string) => {
        if (selectedSBCs.includes(sbc)) {
            const newSBCs = selectedSBCs.filter(s => s !== sbc && s !== "");
            setSBCSelected(newSBCs);
        } else {
            const newSBCs = [...selectedSBCs, sbc];
            setSBCSelected(newSBCs);
        }
    }
    const handleMajorClick = (major: string) => {
        if (selectedMajors.includes(major)) {
            const newMajors = selectedMajors.filter(m => m !== major && m !== "");
            setMajorsSelected(newMajors);
            } else {
            const newMajors = [...selectedMajors, major];
            setMajorsSelected(newMajors);
            }
        }
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {   
                    handleFilterClose()
            }
        }
        if (filterScreen) {
            window.addEventListener("keydown", handleEscapeKey)
            return () => {
              window.removeEventListener("keydown", handleEscapeKey)
            }
        }            
    })
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            onClick={handleFilterClose}
        >
            <div
                className="w-[75%] h-[80%] rounded-xl border bg-card shadow-lg flex flex-col md:flex-row"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full flex flex-col md:w-[35%] border-b md:border-b-0 md:border-r p-4 md:p-6">
                    <div className="space-y-4 bg-card/20 p-4 rounded-md overflow-auto">
                        <h2 className="text-lg md:text-xl font-semibold">Majors</h2>
                        <div className="space-y-1 max-h-[200px] md:max-h-none ">
                            {initialDepartments.map((department, index) => (
                                <button
                                    key={index}
                                    className={`w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-accent transition-colors  text-foreground ${selectedMajors.includes(department as string) ? 'bg-accent' : 'bg-card/50'}`}
                                    onClick={() => handleMajorClick(department as string)}
                                >
                                <div className="flex p-2 flex-row items-center">
                                    <span>{department}</span>
                                    <div className="flex flex-grow"></div>
                                </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-[65%] flex-1 p-4 md:p-6 bg-card/30 space-y-6 md:space-y-8 overflow-y-auto">
                    <div className="space-y-4 p-4">
                        <h2 className="text-lg md:text-xl font-semibold">SBCs</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {initialSBCs.map((sbc, index) => (
                            <div className="flex flex-col" key={index}>
                            <button
                                className={`p-2 md:p-4 rounded-lg aspect-[16/9] border-4 transition-colors 
                                flex flex-col items-center bg-background justify-center  gap-1 md:gap-2 text-xs md:text-sm
                                ${selectedSBCs.includes(sbc) 
                                    ? 'border-primary hover:bg-background/40' 
                                    : 'border-background hover:border-primary' }`}
                                onClick={() => handleSBCClick(sbc)}
                            >
                                {sbc}
                            </button>
                            </div>
                        ))}
                    </div>
                </div>
                </div>
            </div>
        </div>
    )
}