export interface AIGeneratedTask {
  content: string;
  due_date?: Date | null;
  completed?: boolean;
}
export interface UseAITaskGenerationParams {
  enabled?: boolean;
}
