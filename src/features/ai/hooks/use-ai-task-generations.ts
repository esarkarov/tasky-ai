import { useState, useCallback, useMemo } from 'react';
import { UseAITaskGenerationParams } from '../types';

export const useAITaskGeneration = ({ enabled }: UseAITaskGenerationParams = {}) => {
  const [aiEnabled, setAiEnabled] = useState(enabled ?? false);
  const [aiPrompt, setAiPrompt] = useState('');

  const isValid = useMemo(() => {
    return !aiEnabled || aiPrompt.trim().length > 0;
  }, [aiEnabled, aiPrompt]);

  const handleReset = useCallback(() => {
    setAiEnabled(false);
    setAiPrompt('');
  }, []);

  const toggleAI = useCallback(() => {
    setAiEnabled((prev) => !prev);
  }, []);

  return {
    aiEnabled,
    aiPrompt,
    isValid,

    setAiEnabled,
    setAiPrompt,
    handleReset,
    toggleAI,
  };
};
