import { Box, Flex, Heading, Spinner } from '@chakra-ui/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getAllTips } from 'src/utils/tips';

const TIMER = 10000;

export default function LoadingScreen() {
  const [currentTip, setCurrentTip] = useState(Math.random() * 5);
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastChangeRef = useRef<number>(Date.now());
  const tips = getAllTips();

  const selectRandomTip = useCallback(() => {
    const newIndex = Math.floor(Math.random() * tips.length);
    // Ensure we don't show the same tip twice in a row
    if (newIndex === currentTip && tips.length > 1) {
      return (newIndex + 1) % tips.length;
    }
    return newIndex;
  }, [currentTip, tips.length]);

  const changeTip = useCallback(() => {
    const now = Date.now();
    // Prevent changing too quickly (minimum 1 second between changes)
    if (now - lastChangeRef.current < 1000) return;

    lastChangeRef.current = now;
    setIsVisible(false);

    // Reset any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new tip after fade out
    setTimeout(() => {
      setCurrentTip(selectRandomTip());
      setIsVisible(true);

      // Start new timer
      timerRef.current = setTimeout(changeTip, TIMER);
    }, 300);
  }, [selectRandomTip]);

  // Initial setup
  useEffect(() => {
    setCurrentTip(selectRandomTip());
    timerRef.current = setTimeout(changeTip, TIMER);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Flex
      alignItems={'center'}
      justifyContent={'center'}
      width={'100%'}
      height={'100vh'}
      onClick={changeTip}
      style={{
        background: `linear-gradient(135deg, #8ecae6 0%, #219ebc 100%)`,
      }}
      position={'absolute'}
      top={0}
      left={0}
      zIndex={1000}
    >
      <Box p={8} textAlign={'center'} maxWidth={'2xl'} mx={'auto'}>
        {/* Logo */}
        <Heading
          as={'h1'}
          size={'4xl'}
          color={'#023047'}
          fontWeight={'bold'}
          fontFamily={'monospace'}
          mb={4}
        >
          Muninn
        </Heading>
        {/* Loading spinner */}
        <Spinner size={'xl'} color={'#023047'} thickness={'4px'} mt={8} />
        {/* Tip display with fade animation */}
        <Box
          fontSize={'xl'}
          fontFamily={'monospace'}
          style={{ color: '#023047' }}
          p={8}
          background={'rgba(255, 255, 255, 0.5)'}
          transition={'opacity 0.3s'}
          mt={12}
          opacity={isVisible ? 1 : 0}
          borderRadius={'md'}
        >
          💡 {tips[currentTip]}
        </Box>
        <Box my={4} fontSize={'sm'} style={{ color: '#023047' }}>
          Click anywhere to see another tip
        </Box>
      </Box>
    </Flex>
  );
}
