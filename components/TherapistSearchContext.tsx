"use client";

import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from 'react';

interface FilterState {
  conditions?: string[];
  therapyTypes?: string[];
  sessionFormats?: string[];
  ageGroups?: string[];
  locations?: string[];
  availability?: string[];
  searchQuery?: string;
}

interface TherapistSearchContextType {
  filterState: FilterState;
  setFilterState: (filters: FilterState) => void;
  clearFilterState: () => void;
}

const TherapistSearchContext = createContext<TherapistSearchContextType | undefined>(undefined);

export function TherapistSearchProvider({ children }: { children: ReactNode }) {
  const [filterState, setFilterStateInternal] = useState<FilterState>({});

  const setFilterState = useCallback((filters: FilterState) => {
    setFilterStateInternal(prev => ({
      ...prev,
      ...filters
    }));
  }, []);

  const clearFilterState = useCallback(() => {
    setFilterStateInternal({});
  }, []);

  const value = useMemo(
    () => ({ filterState, setFilterState, clearFilterState }),
    [filterState, setFilterState, clearFilterState]
  );

  return (
    <TherapistSearchContext.Provider value={value}>
      {children}
    </TherapistSearchContext.Provider>
  );
}

export function useTherapistSearch() {
  const context = useContext(TherapistSearchContext);
  if (context === undefined) {
    throw new Error('useTherapistSearch must be used within a TherapistSearchProvider');
  }
  return context;
}
