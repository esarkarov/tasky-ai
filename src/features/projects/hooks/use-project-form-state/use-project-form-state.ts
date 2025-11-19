import { PROJECT_COLORS } from '@/features/projects/constants';
import type { ColorValue, ProjectInput } from '@/features/projects/types';
import { useCallback, useMemo, useState } from 'react';
export interface UseProjectFormStateParams {
  defaultValues?: ProjectInput;
}

export const useProjectFormState = ({ defaultValues }: UseProjectFormStateParams) => {
  const [name, setName] = useState(defaultValues?.name || '');
  const [color, setColor] = useState<ColorValue>({
    name: defaultValues?.color_name || PROJECT_COLORS[0].name,
    hex: defaultValues?.color_hex || PROJECT_COLORS[0].hex,
  });

  const formValues = useMemo(
    () => ({
      id: defaultValues?.id,
      name,
      color_name: color.name,
      color_hex: color.hex,
    }),
    [defaultValues?.id, name, color.name, color.hex]
  );
  const isValid = useMemo(() => name.trim().length > 0, [name]);

  const handleReset = useCallback(() => {
    setName(defaultValues?.name || '');
    setColor({
      name: defaultValues?.color_name || PROJECT_COLORS[0].name,
      hex: defaultValues?.color_hex || PROJECT_COLORS[0].hex,
    });
  }, [defaultValues?.name, defaultValues?.color_name, defaultValues?.color_hex]);

  return {
    formValues,
    name,
    color,
    isValid,

    setName,
    setColor,
    handleReset,
  };
};
