// components/view-controller/DensitySelector.tsx
import React, { useCallback } from 'react';
import { Text, ButtonGroup, Button, VStack } from '@chakra-ui/react';
import { DisplayDensity } from '../../types/view-config';

interface DensitySelectorProps {
  value: DisplayDensity;
  onChange: (density: DisplayDensity) => void;
}
// components/view-controller/DensitySelector.tsx
export const DensitySelector: React.FC<DensitySelectorProps> = ({
  value,
  onChange,
}) => {
  const handleDensityChange = useCallback(
    (newDensity: DisplayDensity) => {
      onChange(newDensity);
    },
    [onChange]
  );

  return (
    <VStack spacing={2} align='stretch'>
      <Text fontSize='sm' fontWeight='medium'>
        Display Density
      </Text>
      <ButtonGroup size='sm' isAttached variant='outline'>
        <Button
          onClick={() => handleDensityChange('comfortable')}
          isActive={value === 'comfortable'}
          flex={1}
        >
          Comfortable
        </Button>
        <Button
          onClick={() => handleDensityChange('compact')}
          isActive={value === 'compact'}
          flex={1}
        >
          Compact
        </Button>
      </ButtonGroup>
    </VStack>
  );
};
