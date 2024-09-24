// import multiple choice component from chakra-ui
// TODO: example of custom render UI for multiple_choice
import { Box, Tag, Text } from '@chakra-ui/react';
type MultipleChoiceProps = {
  max_choice: number;
  min_choice: number;
  options: string[];
  value: string;
  title: string;
};

export const MultipleChoice = (props: MultipleChoiceProps) => {
  const { min_choice, max_choice, options, value, title } = props;

  return (
    <Box position='relative'>
      <Box>{title}</Box>
      <Box>
        Value is:{' '}
        {value.split(',').map((v, i) => (
          <Text as='span' key={i}>
            {v}
          </Text>
        ))}
      </Box>
      <Box>
        Select at least {min_choice} and maximum of {max_choice} from{' '}
        {options.map((v, i) => (
          <Tag as='span' key={i}>
            {v}
          </Tag>
        ))}
      </Box>
    </Box>
  );
};
