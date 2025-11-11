import { Models } from 'appwrite';

export interface BaseEntity extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface PaginatedResponse<T> {
  total: number;
  documents: T[];
}
