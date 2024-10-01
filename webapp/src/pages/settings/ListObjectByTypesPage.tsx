import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import BreadcrumbComponent from 'src/components/Breadcrumb';
import ObjectsByType from 'src/components/views/objects-by-type/ObjectsByType';
import {
  fetchObjectsByTypeAdvanced,
  FetchObjectsByTypeParams,
} from 'src/api/objType';
import { listTags } from 'src/api/tag';
import { useEffect, useState } from 'react';
import { ObjectType } from 'src/types';

const ListObjectByTypesPage = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const [objectTypeId, setObjectTypeId] = useState(typeId);
  const [objectType, setObjectType] = useState<ObjectType | undefined>();
  const handleFetchObjects = async (params: FetchObjectsByTypeParams) => {
    const response = await fetchObjectsByTypeAdvanced(params);
    setObjectType(response.objectType);
    return response;
  };
  useEffect(() => {
    setObjectTypeId(typeId);
  }, [typeId]);
  return (
    <Box>
      <BreadcrumbComponent label={objectType?.name} />
      <ObjectsByType
        typeId={objectTypeId}
        fetchObjectsByTypeAdvanced={handleFetchObjects}
        listTags={listTags}
      />
    </Box>
  );
};

export default ListObjectByTypesPage;
