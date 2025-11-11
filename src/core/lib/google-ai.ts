import { env } from '@/core/config/env.config';
import { GoogleGenAI } from '@google/genai';

export const genAI = new GoogleGenAI({ apiKey: env.geminiApiKey });
