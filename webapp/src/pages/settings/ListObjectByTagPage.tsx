import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import { useCallback, useEffect, useState } from 'react';
import {
  ViewConfigBase,
  ViewConfigSource,
} from 'src/features/advanced-filter/types/view-config';
import { FilterConfig } from 'src/types/FilterConfig';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { AdvancedFilter } from 'src/features/advanced-filter';
import LoadingPanel from 'src/components/LoadingPanel';
import { STANDARD_COLUMNS } from 'src/features/advanced-filter/constants/default-columns';
import { Tag } from 'src/types';

const ListObjectByTagPage = () => {
  const { id: tagId } = useParams<{ id: string }>();
  const { getTagsMeta } = useGlobalContext();
  const [tag, setTag] = useState<Tag>();
  const loadTag = useCallback(async () => {
    const allTagIds = [tagId];
    const allTags = await getTagsMeta(allTagIds);
    setTag(allTags.filter((t) => t.id === tagId)[0]);
  }, [tagId, getTagsMeta]);
  useEffect(() => {
    loadTag();
  }, [loadTag]);
  const viewSource: ViewConfigSource = {
    type: 'temporary',
  };
  const standardColumns = STANDARD_COLUMNS.map((col, index) => ({
    field: col.field,
    label: col.label,
    width: col.width,
    visible: col.field === 'tags' ? true : col.defaultVisible,
    order: col.order,
    formatType: col.formatType,
    sortable: col.sortable,
  }));

  const [initialConfig, setInitialConfig] = useState<{
    filter?: Partial<FilterConfig>;
    view?: Partial<ViewConfigBase>;
  }>({
    filter: {
      tagIds: [tagId],
    },
    view: {
      displayMode: 'table',
      density: 'comfortable',
      columns: standardColumns,
    },
  });

  const handleFilterChange = useCallback(
    (newFilter: FilterConfig) => {
      const hasDefaultFilter = (newFilter.tagIds || []).includes(tagId);
      if (!hasDefaultFilter) {
        newFilter.tagIds = newFilter.tagIds
          ? [...newFilter.tagIds, tagId]
          : [tagId];
      }
      setInitialConfig({
        filter: newFilter,
        view: initialConfig.view,
      });
    },
    [initialConfig?.view, tagId]
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
      <BreadcrumbComponent label={tag?.name} />
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

export default ListObjectByTagPage;
