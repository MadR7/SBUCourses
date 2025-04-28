'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CourseList } from '@/components/course-list'
import FilterScreen from '@/components/filter-screen'
import { useDebounce } from '@/hooks/use-debounce'
import { type Course } from '@/types/Course'
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react'
import { CourseInfoDialog } from '@/components/course-info-dialog'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Props for the CoursePage component.
 * Defines the initial data required for rendering courses and filters.
 */
interface CourseSearchProps {
    /** Initial list of courses fetched on the server based on initial URL parameters. */
    initialCourses: Course[]
    /** List of all available departments/majors. */
    initialDepartments: (string | null)[]
    /** List of all available SBCs (Stony Brook Curriculum codes). */
    initialSBCs: string[]
}

/**
 * The main client component responsible for displaying courses, handling search,
 * filtering, and showing course details. It interacts with URL search parameters
 * to maintain state across navigation and refreshes.
 *
 * @component
 * @param {CourseSearchProps} props - The props for the component.
 * @param {Course[]} props.initialCourses - The initial set of courses to display.
 * @param {(string | null)[]} props.initialDepartments - List of all department codes.
 * @param {string[]} props.initialSBCs - List of all SBC codes.
 * @returns {JSX.Element} The rendered CoursePage component.
 */
export function CoursePage({ initialCourses, initialDepartments, initialSBCs }: CourseSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Memoized values derived from current URL search parameters
    const currentMajors = useMemo(() => searchParams.get("majors")?.split(",").filter(Boolean) || [], [searchParams]);
    const currentSBCs = useMemo(() => searchParams.get("sbcs")?.split(",").filter(Boolean) || [], [searchParams]);
    const currentSearch = searchParams.get("search") || "";

    // State for the search input field
    const [searchInput, setSearchInput] = useState(currentSearch);
    // Debounced search input value to delay URL updates
    const debouncedSearchInput = useDebounce(searchInput, 250).trim();

    // State for selected courses (currently commented out functionality)
    const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
    // State to manage the course info dialog (popup)
    const [selectedCourseInfo, setSelectedCourseInfo] = useState<Course | null>(null);
    // State for toggling visibility of selected courses list (currently commented out)
    const [showSelectedCourses, setShowSelectedCourses] = useState(true);
    // State to control the visibility of the filter screen overlay
    const [filterScreen, setFilterScreen] = useState(false);
    // State to control the visibility of the course info dialog
    const [popUp, setPopUp] = useState(false);

    /**
     * Callback to toggle a course's selection state.
     * Currently commented out.
     * @param {Course} course - The course to toggle.
     */
    const toggleCourse = useCallback((course: Course) => {
        // if (selectedCourses.includes(course)){
        //     setSelectedCourses(selectedCourses.filter(c => c.id !== course.id));
        // }else{
        //     setSelectedCourses([...selectedCourses, course]);
        // }
    }, []);

    /**
     * Callback to open the course info dialog for a specific course.
     * Sets the `popUp` state to true and updates `selectedCourseInfo`.
     * @param {Course} course - The course to display information for.
     */
    const handleCourseInfo = useCallback((course: Course) => {
        setPopUp(true);
        setSelectedCourseInfo(course);
    }, []);

    /**
     * Callback to clear the selected course info when the dialog starts closing.
     */
    const handleCloseCourseInfo = useCallback(() => {
        setSelectedCourseInfo(null);
    }, []);

    /**
     * Updates the URL search parameters based on selected filters and search query.
     * Uses router.replace to avoid adding to browser history for filter changes.
     * @param {string[]} majors - Array of selected major codes.
     * @param {string[]} sbcs - Array of selected SBC codes.
     * @param {string} [search] - Optional search query string.
     */
    const updateFilters = useCallback(
        (majors: string[], sbcs: string[], search?: string) => {
            const params = new URLSearchParams(searchParams.toString()); // Preserve existing params initially

            // Update majors param
            if (majors.length){
                params.set("majors", majors.join(","));
            } else {
                params.delete("majors");
            }
            // Update sbcs param
            if (sbcs.length){
                params.set("sbcs", sbcs.join(","));
            } else {
                params.delete("sbcs");
            }
            // Update search param
            if (search){
                params.set("search", search);
            } else {
                params.delete("search");
            }

            // Update the URL if parameters have changed
            if (params.toString() !== searchParams.toString()) {
                 router.replace(`/?${params.toString()}`, { scroll: false });
            }
        },
        [router, searchParams] // Depend on searchParams to get the latest base
    );

    /**
     * Opens the filter screen overlay.
     */
    const handleFilterClick = () => setFilterScreen(true);

    /**
     * Callback passed to FilterScreen to handle changes in selected majors.
     * Updates the URL parameters.
     * @param {string[]} majors - The newly selected majors.
     */
    const handleMajorsChange = useCallback(
        (majors: string[]) => {
            updateFilters(majors, currentSBCs, debouncedSearchInput);
        },
        [updateFilters, currentSBCs, debouncedSearchInput]
    );

    /**
     * Callback passed to FilterScreen to handle changes in selected SBCs.
     * Updates the URL parameters.
     * @param {string[]} sbcs - The newly selected SBCs.
     */
    const handleSBCsChange = useCallback(
        (sbcs: string[]) => {
            updateFilters(currentMajors, sbcs, debouncedSearchInput);
        },
        [updateFilters, currentMajors, debouncedSearchInput]
    );

    /**
     * Callback to update the search input state as the user types.
     * @param {string} search - The current value of the search input.
     */
    const handleSearchChange = useCallback(
        (search: string) => {
            setSearchInput(search);
        },
        []
    );

    /**
     * Effect to update URL filters when the debounced search input changes.
     * Also runs when currentMajors or currentSBCs change (derived from URL).
     */
    useEffect(() => {
        updateFilters(currentMajors, currentSBCs, debouncedSearchInput);
    }, [debouncedSearchInput, currentMajors, currentSBCs, updateFilters]);

    /**
     * Memoized list of available courses to display.
     * Filters out courses that are currently selected (commented out functionality).
     */
    const availableCourses = useMemo(
        () =>
            initialCourses.filter(
                (course) => !selectedCourses.some((selected) => selected.course_id === course.course_id)
            ),
        [initialCourses, selectedCourses] // selectedCourses dependency is currently inactive
    );

    /**
     * Closes the CourseInfoDialog and clears the selected course info.
     */
    const handlePopUpClose = () => {
        setPopUp(false);
        handleCloseCourseInfo();
    }

    return (
        <div>
            {/* Render Course Info Dialog when popUp is true */}
            {popUp && <CourseInfoDialog popUp={popUp} course={selectedCourseInfo} handleClose={handlePopUpClose}/>}
            {/* Render Filter Screen Overlay when filterScreen is true */}
            {filterScreen && <FilterScreen initialDepartments={initialDepartments} initialSBCs={initialSBCs} filterScreen={filterScreen} setFilterScreen={setFilterScreen} setMajorsSelected={handleMajorsChange} setSBCSelected={handleSBCsChange} />}
            <div>
                {/* Section for selected courses (currently commented out) */}
                {/* <section className="mb-8"> ... </section> */}

                {/* Section for searching and displaying available courses */}
                <section>
                    {/* Search Input and Filter Button */}
                    <div className="relative flex flex-row items-center justify-center mb-4">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search courses, descriptions, etc"
                            className="w-full bg-gray-100 text-black pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]"
                            onChange={(e) => handleSearchChange(e.target.value)}
                            value={searchInput} // Controlled input
                        />
                        <button onClick={handleFilterClick} aria-label="Open filters">
                            <SlidersHorizontal className="w-8 h-8 ml-2"/>
                        </button>
                    </div>
                    {/* List of Available Courses */}
                    <CourseList
                        courses={availableCourses} // Use initialCourses directly as filtering is commented out
                        isSelected={false}         // Prop indicating these are not selected courses
                        onToggleCourse={toggleCourse} // Callback for selecting/deselecting (inactive)
                        onInfoClick={handleCourseInfo} // Callback to show course details
                    />


                </section>
            </div>

        </div>
    )
}
