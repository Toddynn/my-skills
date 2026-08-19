import { CreateFaqDto } from '@/modules/faq/models/dto/input/create-faq.dto';
import { FaqDto } from '@/modules/faq/models/dto/output/faq.dto';
import { ApiDocsCreate } from '@/shared/helpers/api-docs';

export function CreateFaqAdminDocs() {
	return ApiDocsCreate('Create frequently asked question', CreateFaqDto, FaqDto, []);
}
