import { useDisclosure } from '@/shared/hooks/use-disclosure/use-disclosure';
import { useCallback, useState } from 'react';
import type { ColorValue, UseColorPickerParams } from '../types';

export const useColorPicker = ({ defaultColor, onColorChange }: UseColorPickerParams) => {
  const { isOpen, open: openSelect, close: cancelSelect } = useDisclosure();
  const [selectedColor, setSelectedColor] = useState<ColorValue>(defaultColor);

  const handleColorSelect = useCallback(
    (value: string) => {
      const [colorName, colorHex] = value.split('=');
      const newColor = { name: colorName, hex: colorHex };

      setSelectedColor(newColor);
      cancelSelect();
      onColorChange?.(newColor);
    },
    [cancelSelect, onColorChange]
  );

  return {
    isOpen,
    selectedColor,

    openSelect,
    cancelSelect,
    handleColorSelect,
  };
};
