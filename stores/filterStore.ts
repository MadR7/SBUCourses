import {create} from 'zustand';

interface filterStore{
    SBCs: string[];
    departments: string[];
    search: string | null;
    filterScreen: boolean;
    filterLoading: boolean;
    filterActions:{
        setSearch(value: string): void;
        setSBCs: (SBCs: string[]) => void;
        setDepartments: (departments: string[]) => void;
        setLoading: (loading: boolean) => void;
        setFilterScreen: (filterScreen: boolean) => void;

    }   
}

export const useFilterStore = create<filterStore>((set) => ({
    SBCs: [],
    departments: [],
    search: null,
    filterScreen: false,
    filterLoading: false,
    filterActions:{
        setSBCs: (SBCs: string[]) => set({SBCs: SBCs}),
        setSearch: (search: string | null) => set({search: search}),
        setDepartments: (departments: string[]) => set({departments: departments}),
        setLoading: (loading: boolean) => set({filterLoading: loading}),
        setFilterScreen: (filterScreen: boolean) => set({filterScreen: filterScreen}),
    }
}))