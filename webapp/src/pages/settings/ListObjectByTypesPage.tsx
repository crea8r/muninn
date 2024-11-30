import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { useCallback, useEffect, useState } from 'react';
import { ObjectType } from 'src/types';
import {
  ViewConfigBase,
  ViewConfigSource,
} from 'src/features/advanced-filter/types/view-config';
import { FilterConfig } from 'src/types/FilterConfig';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { AdvancedFilter } from 'src/features/advanced-filter';
import LoadingPanel from 'src/components/LoadingPanel';

const ListObjectByTypesPage = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const { globalData } = useGlobalContext();
  const viewSource: ViewConfigSource = {
    type: 'temporary',
  };
  const [objectType, setObjectType] = useState<ObjectType | null>(null);
  const [initialConfig, setInitialConfig] = useState<{
    filter?: Partial<FilterConfig>;
    view?: Partial<ViewConfigBase>;
  }>({
    filter: {
      typeIds: [typeId],
    },
    view: {
      density: 'comfortable',
      displayMode: 'table',
      columns: [],
    },
  });

  useEffect(() => {
    const objectTypes = globalData?.objectTypeData?.objectTypes || [];
    const currentObjectType =
      objectTypes.find((type) => type.id === typeId) || null;
    const columns =
      window.Object.keys(currentObjectType?.fields || []).map((field) => ({
        field,
        objectTypeId: typeId,
        order:
          typeof currentObjectType.fields[field] === 'string'
            ? 0
            : currentObjectType.fields[field].meta.order,
        visible: true,
        sortable: true,
        width: 150,
      })) || [];
    columns.sort((a, b) => (a.order || 0) - (b.order || 0));
    setObjectType(currentObjectType);
    setInitialConfig((prev) => {
      if (!prev) return {};
      let oldColumns = prev.view?.columns || [];
      oldColumns = oldColumns.filter((col) => col.objectTypeId !== typeId);
      return {
        ...prev,
        view: {
          ...(prev.view || {}),
          columns: [...oldColumns, ...columns],
        },
      };
    });
  }, [globalData, typeId]);

  const handleFilterChange = useCallback(
    (newFilter: FilterConfig) => {
      const hasDefaultFilter = (newFilter.typeIds || []).includes(typeId);
      if (!hasDefaultFilter) {
        newFilter.typeIds = newFilter.typeIds
          ? [...newFilter.typeIds, typeId]
          : [typeId];
      }
      setInitialConfig({
        filter: newFilter,
        view: initialConfig.view,
      });
    },
    [initialConfig?.view, typeId]
  );

  const handleViewChange = useCallback(
    (newView: ViewConfigBase) => {
      setInitialConfig({
        filter: initialConfig?.filter,
        view: newView,
      });
    },
    [initialConfig?.filter]
  );

  return (
    <Box>
      <BreadcrumbComponent label={objectType?.name} />
      <Box height='calc(100vh - 120px)' bg='white' p={0}>
        {!initialConfig ? (
          <LoadingPanel />
        ) : (
          <AdvancedFilter
            viewSource={viewSource}
            initialFilter={initialConfig?.filter}
            initialViewConfig={initialConfig?.view as ViewConfigBase}
            onFilterChange={handleFilterChange}
            onViewConfigChange={handleViewChange}
          />
        )}
      </Box>
    </Box>
  );
};

export default ListObjectByTypesPage;
