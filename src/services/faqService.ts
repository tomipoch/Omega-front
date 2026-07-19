import { apiGet } from './apiClient';
import type { FaqItem } from '../types';

export const getFaq = (): Promise<FaqItem[]> => apiGet<FaqItem[]>('/faq/');