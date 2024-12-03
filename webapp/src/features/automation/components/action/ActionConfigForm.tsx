import { FormControl, FormLabel, Select } from '@chakra-ui/react';
import TagInput from 'src/components/TagInput';
import { useGlobalContext } from 'src/contexts/GlobalContext';
import { ActionConfig } from 'src/types/Automation';

interface ActionConfigFormProps {
  excludeTagIds: string[];
  excludeFunnelId: string;
  value: ActionConfig;
  onChange: (config: any) => void;
  isLoading: boolean;
}

export const ActionConfigForm = ({
  excludeTagIds,
  excludeFunnelId,
  value,
  onChange,
  isLoading,
}: ActionConfigFormProps) => {
  const { globalData } = useGlobalContext();
  return (
    <>
      <FormControl>
        <FormLabel>Choose a tag</FormLabel>
        <TagInput
          tags={value.tagId ? [value.tagId] : []}
          onChange={(params) => {
            onChange({
              ...value,
              tagId: params[0],
            });
          }}
          availableTags={
            globalData?.tagData?.tags.filter(
              (t) => !excludeTagIds?.includes(t.id)
            ) || []
          }
          isLoading={isLoading}
          limit={1}
        />
      </FormControl>
      <FormControl mt={2}>
        <FormLabel>Choose a funnel</FormLabel>
        <Select
          value={value?.funnelId}
          onChange={(e: any) => {
            onChange({
              ...value,
              funnelId: e.target.value,
            });
          }}
          isDisabled={isLoading}
        >
          <option value={undefined}>Select funnel</option>
          {globalData?.funnelData?.funnels.map((funnel) => (
            <option key={funnel.id} value={funnel.id}>
              {funnel.name}
            </option>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
