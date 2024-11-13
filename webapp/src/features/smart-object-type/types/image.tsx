// src/features/smart-object-type/types/image/index.tsx
import React, { useState } from 'react';
import {
  Box,
  Input,
  VStack,
  Image,
  FormControl,
  FormLabel,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Text,
  HStack,
  Skeleton,
  Icon,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { ObjectTypeImplementation, BaseValidation } from '../type';

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageValidation extends BaseValidation {
  maxSize?: number; // in bytes
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: 'free' | 'square' | 'landscape' | 'portrait' | number;
  previewSize?: 'small' | 'medium' | 'large';
}

// Helper functions
const getImageDimensions = (url: string): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new HTMLImageElement();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });
};

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isBase64Image = (str: string) => {
  return str.startsWith('data:image/');
};

const getPreviewSize = (
  size: ImageValidation['previewSize'] = 'medium'
): number => {
  switch (size) {
    case 'small':
      return 100;
    case 'large':
      return 300;
    default:
      return 200;
  }
};

// Components
const ImagePreview: React.FC<{
  src: string;
  size?: ImageValidation['previewSize'];
  onError?: () => void;
}> = ({ src, size = 'medium', onError }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const previewSize = getPreviewSize(size);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <Box
        width={previewSize}
        height={previewSize}
        bg='gray.100'
        display='flex'
        alignItems='center'
        justifyContent='center'
        borderRadius='md'
      >
        <VStack spacing={2}>
          <Icon as={WarningIcon} color='red.500' boxSize={6} />
          <Text fontSize='sm' color='gray.500'>
            Failed to load image
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box position='relative' width={previewSize} height={previewSize}>
      <Skeleton
        isLoaded={!isLoading}
        width={previewSize}
        height={previewSize}
        borderRadius='md'
      >
        <Image
          src={src}
          alt='Preview'
          objectFit='contain'
          width={previewSize}
          height={previewSize}
          borderRadius='md'
          onLoad={() => setIsLoading(false)}
          onError={handleError}
        />
      </Skeleton>
    </Box>
  );
};

const ImageDisplay: React.FC<{
  value: string;
  validation?: ImageValidation;
}> = ({ value, validation }) => {
  if (!value) return null;

  return <ImagePreview src={value} size={validation?.previewSize} />;
};

const ImageInput: React.FC<{
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  validation?: ImageValidation;
}> = ({ value, onChange, validation }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateImage = async (url: string): Promise<true | string> => {
    // Check if URL is valid
    if (!isValidUrl(url) && !isBase64Image(url)) {
      return 'Invalid image URL or Base64 data';
    }

    try {
      const dimensions = await getImageDimensions(url);

      if (validation?.minWidth && dimensions.width < validation.minWidth) {
        return `Image width must be at least ${validation.minWidth}px`;
      }

      if (validation?.minHeight && dimensions.height < validation.minHeight) {
        return `Image height must be at least ${validation.minHeight}px`;
      }

      if (validation?.maxWidth && dimensions.width > validation.maxWidth) {
        return `Image width must be at most ${validation.maxWidth}px`;
      }

      if (validation?.maxHeight && dimensions.height > validation.maxHeight) {
        return `Image height must be at most ${validation.maxHeight}px`;
      }

      if (validation?.aspectRatio) {
        const ratio = dimensions.width / dimensions.height;
        if (typeof validation.aspectRatio === 'number') {
          if (Math.abs(ratio - validation.aspectRatio) > 0.01) {
            return `Image must have an aspect ratio of ${validation.aspectRatio}`;
          }
        } else {
          switch (validation.aspectRatio) {
            case 'square':
              if (Math.abs(ratio - 1) > 0.01) return 'Image must be square';
              break;
            case 'landscape':
              if (ratio <= 1) return 'Image must be landscape';
              break;
            case 'portrait':
              if (ratio >= 1) return 'Image must be portrait';
              break;
          }
        }
      }

      return true;
    } catch (error) {
      return 'Failed to load image';
    }
  };

  const handleChange = async (url: string) => {
    setIsValidating(true);
    setValidationError(null);

    const validationResult = await validateImage(url);
    setIsValidating(false);

    if (validationResult === true) {
      onChange(url, true);
      setValidationError(null);
    } else {
      onChange(url, false);
      setValidationError(validationResult);
    }
  };

  return (
    <VStack align='stretch' spacing={4}>
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder='Enter image URL or base64 data'
        isInvalid={!!validationError}
      />

      {value && (
        <Box>
          <ImagePreview
            src={value}
            size={validation?.previewSize}
            onError={() => setValidationError('Failed to load image')}
          />
        </Box>
      )}

      {validationError && (
        <Text color='red.500' fontSize='sm'>
          {validationError}
        </Text>
      )}

      {isValidating && (
        <Text color='gray.500' fontSize='sm'>
          Validating image...
        </Text>
      )}
    </VStack>
  );
};

const ImageConfigure: React.FC<{
  validation?: ImageValidation;
  onChange: (validation: ImageValidation) => void;
}> = ({ validation = {}, onChange }) => {
  const handleChange = <K extends keyof ImageValidation>(
    key: K,
    value: ImageValidation[K]
  ) => {
    onChange({ ...validation, [key]: value });
  };

  return (
    <VStack spacing={4} align='stretch'>
      <FormControl>
        <FormLabel>Required</FormLabel>
        <Switch
          isChecked={validation.required}
          onChange={(e) => handleChange('required', e.target.checked)}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Preview Size</FormLabel>
        <Select
          value={validation.previewSize || 'medium'}
          onChange={(e) =>
            handleChange(
              'previewSize',
              e.target.value as ImageValidation['previewSize']
            )
          }
        >
          <option value='small'>Small (100px)</option>
          <option value='medium'>Medium (200px)</option>
          <option value='large'>Large (300px)</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Aspect Ratio</FormLabel>
        <Select
          value={validation.aspectRatio || 'free'}
          onChange={(e) => {
            const value = e.target.value;
            handleChange(
              'aspectRatio',
              value === 'free'
                ? undefined
                : value === 'custom'
                ? 1.5 // Default custom ratio
                : (value as ImageValidation['aspectRatio'])
            );
          }}
        >
          <option value='free'>Free</option>
          <option value='square'>Square (1:1)</option>
          <option value='landscape'>Landscape</option>
          <option value='portrait'>Portrait</option>
          <option value='custom'>Custom Ratio</option>
        </Select>
      </FormControl>

      {validation.aspectRatio && typeof validation.aspectRatio === 'number' && (
        <FormControl>
          <FormLabel>Custom Aspect Ratio</FormLabel>
          <NumberInput
            value={validation.aspectRatio}
            onChange={(_, value) => handleChange('aspectRatio', value)}
            min={0.1}
            step={0.1}
            precision={2}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      )}

      <HStack align='start' spacing={4}>
        <FormControl>
          <FormLabel>Min Width (px)</FormLabel>
          <NumberInput
            value={validation.minWidth || ''}
            onChange={(_, value) => handleChange('minWidth', value)}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Min Height (px)</FormLabel>
          <NumberInput
            value={validation.minHeight || ''}
            onChange={(_, value) => handleChange('minHeight', value)}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </HStack>

      <HStack align='start' spacing={4}>
        <FormControl>
          <FormLabel>Max Width (px)</FormLabel>
          <NumberInput
            value={validation.maxWidth || ''}
            onChange={(_, value) => handleChange('maxWidth', value)}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Max Height (px)</FormLabel>
          <NumberInput
            value={validation.maxHeight || ''}
            onChange={(_, value) => handleChange('maxHeight', value)}
            min={0}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </HStack>
    </VStack>
  );
};

export const ImageObjectType: ObjectTypeImplementation<
  ImageValidation,
  string
> = {
  type: 'image',

  validate: (value, validation): true | string => {
    if (!value) {
      return validation.required ? 'This field is required' : true;
    }
  },

  Display: ImageDisplay,
  Input: ImageInput,
  Configure: ImageConfigure,
};
