import { ToasterToast } from '@/shared/hooks/use-toast';

interface Img {
  src: string;
  width: number;
  height: number;
}

export interface EmptyStateContent {
  img: Img;
  title: string;
  description: string;
}

export interface ToastMessages {
  loading: string;
  success: string;
  error: string;
  errorDescription: string;
}

export interface ToastHandler {
  id: string;
  dismiss: () => void;
  update: (options: ToasterToast & { id: string }) => void;
}
