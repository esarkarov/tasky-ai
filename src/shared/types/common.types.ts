import { HTTP_METHODS, HTTP_STATUS } from '@/shared/constants/http';

export type CrudMode = 'create' | 'update';
export type EntityType = 'task' | 'project';
export type EmptyStateVariant = 'today' | 'inbox' | 'upcoming' | 'completed' | 'project';
export type SearchStatus = 'idle' | 'loading' | 'searching';
export type NavigationState = 'idle' | 'loading' | 'submitting';
export type OperationResult = 'success' | 'error';
export type TriggerVariant = 'icon' | 'menu-item';
export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];
