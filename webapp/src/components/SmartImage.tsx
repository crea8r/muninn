import { useState } from 'react';
import NoImage from 'src/assets/NoImage.jpg';

type SmartImageProps = {
  src: string | undefined | string[];
  alt: string;
  style?: any;
};
const SmartImage = ({ src, alt, style = {} }: SmartImageProps) => {
  const [currentSmartImageIndex, setCurrentSmartImageIndex] = useState(0);
  if (!src) {
    return <img src={NoImage} alt={alt} style={style} />;
  }
  if (typeof src === 'string') {
    return (
      <img
        src={src}
        alt={alt}
        onError={(e) => {
          e.currentTarget.src = NoImage;
        }}
        style={style}
      />
    );
  }
  if (Array.isArray(src)) {
    return (
      <img
        src={src[currentSmartImageIndex]}
        alt={''}
        style={style}
        onError={(e) => {
          if (currentSmartImageIndex < src.length) {
            setCurrentSmartImageIndex(currentSmartImageIndex + 1);
            console.log(src[currentSmartImageIndex]);
          } else {
            e.currentTarget.src = NoImage;
          }
        }}
      />
    );
  }
  return <img src='https://via.placeholder.com/150' alt='placeholder' />;
};

export default SmartImage;
