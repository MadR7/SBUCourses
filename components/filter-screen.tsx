"use client"

import React from "react"
import {useSearchParams} from "next/navigation"
import { useEffect } from "react"

/**
 * @interface FilterScreenProps
 * Props for the FilterScreen component.
 */
interface FilterScreenProps {
    /** Whether the filter screen is currently visible. */
    filterScreen: boolean;
    /** Function to update the visibility state of the filter screen. */
    setFilterScreen: React.Dispatch<React.SetStateAction<boolean>>;
    /** List of all available department names. */
    initialDepartments: (string | null)[];
    /** List of all available SBC names. */
    initialSBCs: string[];
    /** Callback function to update the list of selected majors in the parent component. */
    setMajorsSelected: (majors: string[]) => void;
    /** Callback function to update the list of selected SBCs in the parent component. */
    setSBCSelected: (sbcs: string[]) => void;
}

/**
 * @component FilterScreen
 * A modal component that allows users to filter courses by department and SBC.
 * It displays lists of available departments and SBCs, manages selection state based on URL params,
 * and provides callbacks to update the parent component's filter state.
 *
 * @param {FilterScreenProps} props - The component props.
 * @returns {React.ReactElement | null} The rendered filter screen modal, or null if `filterScreen` is false.
 */
export default function FilterScreen(
    {filterScreen, setFilterScreen, initialDepartments, initialSBCs, setMajorsSelected, setSBCSelected}: FilterScreenProps
){
    const searchParams = useSearchParams();
    // Read initial selections from URL parameters, default to empty arrays if not present
    let selectedMajors = searchParams.get("majors")?.split(",").filter(m => m) || []
    let selectedSBCs = searchParams.get("sbcs")?.split(",").filter(s => s) || []

    /**
     * Closes the filter screen modal by setting the `filterScreen` state to false.
     */
    const handleFilterClose = () =>{
        setFilterScreen(false)
    }

    /**
     * Handles clicking on an SBC button. Toggles the selection state of the SBC.
     * Updates the parent component's selected SBCs via `setSBCSelected`.
     * @param {string} sbc - The SBC code that was clicked.
     */
    const handleSBCClick = (sbc: string) => {
        if (selectedSBCs.includes(sbc)) {
            const newSBCs = selectedSBCs.filter(s => s !== sbc && s !== "");
            setSBCSelected(newSBCs);
        } else {
            const newSBCs = [...selectedSBCs, sbc];
            setSBCSelected(newSBCs);
        }
    }
    /**
     * Clears all selected SBCs by calling `setSBCSelected` with an empty array.
     */
    const handleSBCClear = () =>{
        setSBCSelected([]);
    }
    /**
     * Handles clicking on a Major/Department button. Toggles the selection state.
     * Updates the parent component's selected majors via `setMajorsSelected`.
     * @param {string} major - The major/department name that was clicked.
     */
    const handleMajorClick = (major: string) => {
        if (selectedMajors.includes(major)) {
            const newMajors = selectedMajors.filter(m => m !== major && m !== "");
            setMajorsSelected(newMajors);
            } else {
            const newMajors = [...selectedMajors, major];
            setMajorsSelected(newMajors);
            }
    }
    /**
     * Clears all selected majors by calling `setMajorsSelected` with an empty array.
     */
    const handleMajorClear = () =>{
        setMajorsSelected([]);
    }

    /**
     * Effect hook to add a keyboard event listener for the 'Escape' key.
     * When 'Escape' is pressed while the filter screen is open, it calls `handleFilterClose`.
     * Cleans up the event listener when the component unmounts or `filterScreen` becomes false.
     */
    useEffect(() => {
        /**
         * Handles the keydown event, specifically listening for the Escape key.
         * @param {KeyboardEvent} event - The keyboard event.
         */
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

    // The component returns null if filterScreen is false, effectively hiding it.
    if (!filterScreen) return null;

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
                        <div className="flex items-center justify-between">  
                            <h2 className="text-lg md:text-xl font-semibold">Departments</h2>
                            <button className="cursor-pointer" onClick={handleMajorClear}>Clear Departments</button>
                        </div>
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
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg md:text-xl font-semibold">SBCs</h2>
                            <button className="cursor-pointer" onClick={handleSBCClear}>Clear SBCs</button>
                        </div>
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