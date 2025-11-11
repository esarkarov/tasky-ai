import { HTTP_STATUS } from '@/shared/constants/http-methods';

export type CrudMode = 'create' | 'update';
export type EntityType = 'task' | 'project';
export type HttpMethod = 'POST' | 'PUT';
export type EmptyStateVariant = 'today' | 'inbox' | 'upcoming' | 'completed' | 'project';
export type SearchStatus = 'idle' | 'loading' | 'searching';
export type NavigationState = 'idle' | 'loading' | 'submitting';
export type OperationResult = 'success' | 'error';
export type TriggerVariant = 'icon' | 'menu-item';
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
