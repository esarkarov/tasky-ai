import { HttpStatusCode } from '@/shared/types';

export const jsonResponse = (data: unknown, status: HttpStatusCode) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const errorResponse = (message: string, status: HttpStatusCode) => {
  return jsonResponse({ success: false, message }, status);
};

export const successResponse = (message: string, data?: Record<string, unknown>, status: HttpStatusCode = 200) => {
  return jsonResponse({ success: true, message, ...data }, status);
};
