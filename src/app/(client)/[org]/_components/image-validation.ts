import { useState, useEffect } from "react";

const useImageValidation = (imageUrl: string | undefined): boolean => {
  const [isValid, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) {
      setIsValid(false);
      return;
    }

    const img = new Image();
    img.src = imageUrl;

    img.onload = () => setIsValid(true);
    img.onerror = () => setIsValid(false);
  }, [imageUrl]);

  return isValid;
};

export default useImageValidation;
