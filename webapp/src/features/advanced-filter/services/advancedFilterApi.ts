// services/advancedFilterApi.ts
import { axiosWithAuth } from 'src/api/utils';
import { FilterConfig } from 'src/types/FilterConfig';
import { AdvancedFilterResponse } from '../types/response';

// Helper to transform type value criteria to API format
const transformTypeValueCriteria = (
  criteria: Record<string, string> | undefined
) => {
  if (!criteria || !criteria.typeId || !criteria.field || !criteria.value) {
    return undefined;
  }

  // Format: { [field]: value }
  // This creates the criteria in the format your API expects
  return {
    [criteria.field]: criteria.value,
  };
};

export const fetchAdvancedFilterResults = async (
  filterConfig: FilterConfig
): Promise<AdvancedFilterResponse> => {
  // Transform each criteria set
  const criteria1 = transformTypeValueCriteria(
    filterConfig.typeValueCriteria?.criteria1
  );
  const criteria2 = transformTypeValueCriteria(
    filterConfig.typeValueCriteria?.criteria2
  );
  const criteria3 = transformTypeValueCriteria(
    filterConfig.typeValueCriteria?.criteria3
  );

  // Only include criteria that have values
  const params: Record<string, any> = {
    q: filterConfig.search,
    tag_ids: (filterConfig.tagIds || [])?.join(','),
    type_ids: (filterConfig.typeIds || [])?.join(','),
    order_by: filterConfig.sortBy?.startsWith('type_value:')
      ? 'type_value' // Use type_value when sorting by type field
      : filterConfig.sortBy,
    ascending: filterConfig.ascending,
    page: filterConfig.page,
    page_size: filterConfig.pageSize,
  };

  // Add type value criteria only if they exist
  if (criteria1) params.type_value_criteria1 = JSON.stringify(criteria1);
  if (criteria2) params.type_value_criteria2 = JSON.stringify(criteria2);
  if (criteria3) params.type_value_criteria3 = JSON.stringify(criteria3);

  // Add funnel step filters
  if (filterConfig.funnelStepFilter?.funnelId) {
    params.step_ids = (filterConfig.funnelStepFilter.stepIds || []).join(',');

    if (filterConfig.funnelStepFilter.subStatuses.length > 0) {
      params.sub_status = (
        filterConfig.funnelStepFilter.subStatuses || []
      ).join(',');
    }
  }
  // Add type_value_field if sorting by type value
  if (filterConfig.sortBy?.startsWith('type_value:')) {
    params.type_value_field = filterConfig.type_value_field;
  }

  try {
    const response = await axiosWithAuth().get('/objects/advanced', { params });
    return response.data;
  } catch (error) {
    // Log the error for debugging
    console.error('Advanced filter request failed:', {
      config: filterConfig,
      transformedParams: params,
      error,
    });
    throw error;
  }
};
