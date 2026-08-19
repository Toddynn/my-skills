import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListAllFaqsPaginationDto } from '@/modules/faq/models/dto/input/list-all-faqs-pagination.dto';
import { IsPublic } from '@/modules/keycloak-auth/models/decorators/is-public.decorator';
import { ListAllFaqsPaginatedPublicDocs } from './docs';
import { ListAllFaqsPaginatedUseCase } from './list-all-faqs-paginated.use-case';

@ApiTags('Public - Frequent Asked Questions')
@Controller('public/faqs')
@IsPublic()
export class ListAllFaqsPaginatedPublicController {
	constructor(private readonly listAllFaqsPaginatedUseCase: ListAllFaqsPaginatedUseCase) {}

	@ListAllFaqsPaginatedPublicDocs()
	@Get()
	async execute(@Query() paginationDto: ListAllFaqsPaginationDto) {
		return await this.listAllFaqsPaginatedUseCase.execute(paginationDto);
	}
}
