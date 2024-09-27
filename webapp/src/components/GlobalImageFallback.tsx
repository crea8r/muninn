import React, { ReactNode, useEffect } from 'react';
import NoImage from 'src/assets/NoImage.jpg';

interface GlobalImageFallbackProps {
  children: ReactNode;
}

const GlobalImageFallback = ({ children }: GlobalImageFallbackProps) => {
  useEffect(() => {
    const imgs = document.querySelectorAll('img');

    imgs.forEach((img) => {
      img.onerror = () => {
        console.log('Image failed to load ', NoImage);
        img.src = img.getAttribute('data-fallback') || NoImage;
      };
    });
  }, []);

  return <>{children}</>;
};

export default GlobalImageFallback;
