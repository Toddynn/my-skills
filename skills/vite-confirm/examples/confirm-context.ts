import { createContext } from 'react';
import type { ConfirmContextType } from '@/components/ui/modals/confirm-modal/interfaces';

export const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);
