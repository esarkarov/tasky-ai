import { UseDisclosureResult } from '@/shared/types';
import { useCallback, useState } from 'react';

export const useDisclosure = (): UseDisclosureResult => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, setIsOpen, open, close };
};
