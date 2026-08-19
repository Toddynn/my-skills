import type { InferZod } from '@/shared/interfaces/inferzod';
import type { CreatePromptSchema } from './create-prompt-schema';

export type CreatePromptForm = InferZod<typeof CreatePromptSchema>;
