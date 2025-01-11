// import {create} from 'zustand';
// import { type Course } from '@/types/Course';
// export interface store{
//     courses: Course[];
//     setCourses: (courses: Course[]) => void;

//     SBCs: string[];
//     setSBCs: (SBCs: string[]) => void;

//     departments: string[];
//     setDepartments: (departments: string[]) => void;

//     loading: boolean;
//     setLoading: (loading: boolean) => void;

//     showMatrix: boolean;
//     setShowMatrix: (showMatrix: boolean) => void;

//     selectedCourses: Course[];
//     setSelectedCourses: (selectedCourses: Course[]) => void;

//     selectedCourseInfo: Course | null;
//     setSelectedCourseInfo: (selectedCourseInfo: Course | null) => void;

//     showSelectedCourses: boolean;
//     setShowSelectedCourses: (showSelectedCourses: boolean) => void;

//     filterScreen: boolean;
//     setFilterScreen: (filterScreen: boolean) => void;

//     fetchCourses: () => Promise<void>;
//     fetchSBCs: () => Promise<void>;
//     fetchDepartments: () => Promise<void>;

// }

// export const useStore = create<store>((set) => ({
//     courses: [],
//     SBCs: [],
//     departments: [],
//     loading: false,
//     showMatrix: false,
//     selectedCourses: [],
//     selectedCourseInfo: null,
//     showSelectedCourses: true,
//     filterScreen: false,

//     setCourses: (courses: Course[]) => set({courses: courses}),
//     setSBCs: (SBCs: string[]) => set({SBCs: SBCs}),
//     setDepartments: (departments: string[]) => set({departments: departments}),
//     setLoading: (loading: boolean) => set({loading: loading}),
//     setShowMatrix: (showMatrix: boolean) => set({showMatrix: showMatrix}),
//     setSelectedCourses: (selectedCourses: Course[]) => set({selectedCourses: selectedCourses}),
//     setSelectedCourseInfo: (selectedCourseInfo: Course | null) => set({selectedCourseInfo: selectedCourseInfo}),
//     setShowSelectedCourses: (showSelectedCourses: boolean) => set({showSelectedCourses: showSelectedCourses}),
//     setFilterScreen: (filterScreen: boolean) => set({filterScreen: filterScreen}),

//     fetchCourses: async() => {
//         try {
//             const response = await fetch('/api/courses');
//             const data = await response.json();
//             set({courses: data});
//         } catch (error) {
//             console.error('Failed to fetch courses:', error);
//         } finally {
//             set({loading: false});
//         }
//     },
//     // fetchCourses: async (sbcsSelected: string[]) => {
//     //     const params = new URLSearchParams();
//     //     sbcsSelected.forEach(sbc => params.append('sbcs', sbc));
        
//     //     try {
//     //       const response = await fetch(`/api/courses?${params}`);
//     //       const data = await response.json();
//     //       set({ courses: data });
//     //     } catch (error) {
//     //       console.error('Error fetching courses:', error);
//     //       set({ courses: [] });
//     //     }
//     // },
//     fetchSBCs: async() => {
//         try {
//             const response = await fetch('/api/sbc');
//             const data = await response.json();
//             set({SBCs: data});
//         } catch (error) {
//             console.error('Failed to fetch courses:', error);
//         } finally {
//             set({loading: false});
//         }
//     },
//     fetchDepartments: async() => {
//         try {
//             const response = await fetch('/api/departments');
//             const data = await response.json();
//             set({departments: data});
//         } catch (error) {
//             console.error('Failed to fetch courses:', error);
//         } finally {
//             set({loading: false});
//         }
//     }
    
// }));