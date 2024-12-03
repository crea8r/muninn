import React, { createContext, useContext, useState, useCallback } from 'react';
import { SpotLightFilter } from 'src/components/spot-light/SpotLight';

export type SearchFilter = 'object' | 'fact' | 'task' | 'creator';

interface SpotLightContextType {
  isOpen: boolean;
  openSpotLight: (
    filters?: SearchFilter[],
    callback?: (payload: any) => void
  ) => void;
  closeSpotLight: () => void;
  filters: SearchFilter[];
  setFilters: (filters: SearchFilter[]) => void;
  activeFilter: SearchFilter;
  setActiveFilter: (filter: SearchFilter) => void;
  onSelect: (item: { type: SearchFilter; payload: any }) => void;
}

const SpotLightContext = createContext<SpotLightContextType | undefined>(
  undefined
);

export const useSpotLight = () => {
  const context = useContext(SpotLightContext);
  if (!context) {
    throw new Error('useSpotLight must be used within a SpotLightProvider');
  }
  return context;
};

export const SpotLightProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilter[]>([
    'object',
    'fact',
    'task',
    'creator',
  ]);
  const [activeFilter, setActiveFilter] = useState<SearchFilter>('object');
  const [fcallback, setCallback] = useState<any>((payload: any) => {});

  const openSpotLight = useCallback(
    (newFilters?: SearchFilter[], callback?: any) => {
      setIsOpen(true);
      if (!callback) {
        setCallback((payload: any) => {});
      } else {
        setCallback(callback);
      }
      if (newFilters) {
        setFilters(newFilters);
        setActiveFilter(newFilters[0]);
      }
    },
    []
  );

  const closeSpotLight = useCallback(() => {
    setIsOpen(false);
  }, []);

  const onSelect = useCallback(
    (item: { type: SearchFilter; payload: any }) => {
      closeSpotLight();
      if (fcallback) {
        fcallback(item);
      } else {
        // Add logic to open the detail page of the chosen item
        if (item.type === SpotLightFilter.OBJECT) {
          window.location.href = `/objects/${item.payload.id}`;
        }
      }
    },
    [closeSpotLight, fcallback]
  );

  return (
    <SpotLightContext.Provider
      value={{
        isOpen,
        openSpotLight,
        closeSpotLight,
        filters,
        setFilters,
        activeFilter,
        setActiveFilter,
        onSelect,
      }}
    >
      {children}
    </SpotLightContext.Provider>
  );
};
