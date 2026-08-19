import { Inject, Injectable } from '@nestjs/common';
import { ListAllFaqsPaginationDto } from '@/modules/faq/models/dto/input/list-all-faqs-pagination.dto';
import { FaqRepositoryInterface } from '@/modules/faq/models/interface/repository.interface';
import { FAQ_REPOSITORY_INTERFACE_KEY } from '@/modules/faq/shared/constants/repository-interface-key';
import { FaqDtoMapper } from '@/modules/faq/shared/mappers/faq-dto.mapper';
import { AppCacheService } from '@/shared/cache/app-cache.service';
import { APP_CACHE_KEYS } from '@/shared/cache/cache-key.constant';
import { APP_CACHE_TTL_SECONDS } from '@/shared/cache/cache-ttl.constant';

@Injectable()
export class ListAllFaqsPaginatedUseCase {
	constructor(
		@Inject(FAQ_REPOSITORY_INTERFACE_KEY)
		private readonly faqRepository: FaqRepositoryInterface,
		@Inject(FaqDtoMapper)
		private readonly faqDtoMapper: FaqDtoMapper,
		private readonly appCacheService: AppCacheService,
	) {}

	async execute(paginationDto: ListAllFaqsPaginationDto) {
		const cacheKey = this.appCacheService.buildListCacheKey(APP_CACHE_KEYS.faqsListPrefix, paginationDto);

		return this.appCacheService.getOrSet(cacheKey, APP_CACHE_TTL_SECONDS.faqsList, async () => {
			const result = await this.faqRepository.listAllPaginated(paginationDto);
			return this.faqDtoMapper.toPaginatedFaqDto(result);
		});
	}
}
