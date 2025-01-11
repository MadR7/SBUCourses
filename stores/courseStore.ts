import { create } from 'zustand';
import { type Course } from "@/types/Course";
import { type CourseFilter } from "@/types/CourseFilter";

interface CourseStore {
    courseLoading: boolean;
    courses: Course[];
    selectedCourses: Course[];
    selectedCourseInfo: Course | null;
    showSelectedCourses: boolean;
    lastFilter: CourseFilter | null;
    courseActions: {
        setSelectedCourses: (courses: Course[]) => void;
        setSelectedCourseInfo: (selectedCourseInfo: Course | null) => void;
        setShowSelectedCourses: (show: boolean) => void;
    };        
    fetchCourses: (params?: CourseFilter) => Promise<void>;
}

export const useCourseStore = create<CourseStore>((set, get) => ({
    courseLoading: true,
    courses: [],
    selectedCourses: [],
    selectedCourseInfo: null,
    showSelectedCourses: true,
    lastFilter: null,
    courseActions: {
        setSelectedCourses: (courses: Course[]) => set({ selectedCourses: courses }),
        setSelectedCourseInfo: (selectedCourseInfo: Course | null) => 
            set({ selectedCourseInfo: selectedCourseInfo }),
        setShowSelectedCourses: (showSelectedCourses: boolean) => 
            set({ showSelectedCourses: showSelectedCourses }),
    },
    fetchCourses: async(params) => {
        const currentFilter = get().lastFilter;
        const isEqual = JSON.stringify(currentFilter) === JSON.stringify(params);
        
        if (isEqual) return;
        
        try {
            set({ courseLoading: true, lastFilter: params });
            const url = new URL('/api/courses', window.location.origin);
            
            if (params?.department?.length) {
                params.department.forEach(dept => 
                    url.searchParams.append('department', dept)
                );
            }
            
            if (params?.sbc?.length) {
                params.sbc.forEach(sbc => 
                    url.searchParams.append('sbc', sbc)
                );
            }
            if (params?.search) {
                url.searchParams.append('search', params.search);
            }
            const response = await fetch(url.toString());
            const data = await response.json();
            set({ courses: data });
        } catch (error) {
            console.error('Failed to fetch courses:', error);
            set({ courses: [] });
        } finally {
            set({ courseLoading: false });
        }
    },
}));
