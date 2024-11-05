import { UnsavedChangesProvider } from 'src/contexts/unsaved-changes/UnsavedChange';
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
      <UnsavedChangesProvider
        enabled={true}
        bypassUrls={['/login', '/logout']}
        onBeforeUnload={async () => {
          // Optional: Perform any cleanup or last-minute saves
          return true; // Return true to show confirmation, false to allow navigation
        }}
      >
        <AdvancedFilterContainer {...viewProps} />
      </UnsavedChangesProvider>
    </AdvancedFilterProvider>
  );
};
