import React, { useCallback, useEffect } from 'react';
import { MasterFormElementProps } from '../ObjectType';
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
} from '@chakra-ui/react';
import { fetchObjectDetails } from 'src/api';
import { shortenText } from 'src/utils';
interface ObjectPreviewProps {
  objDetail: any;
}
const ObjectPreview = ({ objDetail }: ObjectPreviewProps) => {
  const strarr = objDetail?.typeValues?.map((otv: any) => {
    const str = window.Object.keys(otv.type_values).map((key: any) => {
      if (
        typeof otv.type_values[key] === 'string' &&
        otv.type_values[key] &&
        !otv.type_values[key].includes('http')
      ) {
        return otv.type_values[key];
      }
      return '';
    });
    return str.join(' ,');
  });
  console.log('objDetail ', objDetail);
  return objDetail ? (
    <Flex direction='column' mt={2}>
      <Link
        href={`/objects/${objDetail?.id}`}
        style={{ color: 'blue', textDecoration: 'underline' }}
      >
        {objDetail?.name || objDetail?.idString}
      </Link>
      {strarr.length > 0 && (
        <Text
          mt={2}
          colorScheme='gray.100'
          p={1}
          bgColor={'gray.100'}
          borderRadius={4}
        >
          {shortenText(strarr.join(','), 100)}
        </Text>
      )}
    </Flex>
  ) : (
    <></>
  );
};

export const ElObject: React.FC<MasterFormElementProps> = (
  props: MasterFormElementProps
) => {
  const { field, value, onChange, dataType, style } = props;
  const [objDetail, setObjDetail] = React.useState<any>(null);
  const getObjectDetails = useCallback(async (objectId: string) => {
    try {
      const data = await fetchObjectDetails(objectId);
      setObjDetail(data);
    } catch (e) {}
  }, []);
  useEffect(() => {
    if (value) {
      getObjectDetails(value);
    }
  }, [value, getObjectDetails]);
  return onChange ? (
    <FormControl key={field} style={style || {}}>
      <FormLabel>{field}</FormLabel>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
      {objDetail && <ObjectPreview objDetail={objDetail} />}
      <Text fontSize='sm' color='gray.500'>
        {dataType}
      </Text>
    </FormControl>
  ) : (
    <Flex direction='column'>
      <Text fontSize='sm' color='gray.500'>
        {field}
      </Text>
      {objDetail && <ObjectPreview objDetail={objDetail} />}
    </Flex>
  );
};
