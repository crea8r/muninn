import {
  AdvancedFilterContainer,
  AdvancedFilterContainerProps,
} from './AdvancedFilterContainer';
import { AdvancedFilterProvider } from './contexts/AdvancedFilterContext';
import { FilterConfig } from './types/filters';

// features/advanced-filter/index.tsx
export interface AdvancedFilterProps extends AdvancedFilterContainerProps {
  initialFilter?: Partial<FilterConfig>;
  onFilterChange?: (filter: FilterConfig) => void;
}

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  initialFilter,
  onFilterChange,
  ...viewProps
}) => {
  return (
    <AdvancedFilterProvider
      initialConfig={initialFilter}
      onChange={onFilterChange}
    >
      <AdvancedFilterContainer {...viewProps} />
    </AdvancedFilterProvider>
  );
};
