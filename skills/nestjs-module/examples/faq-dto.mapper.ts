import { Inject, Injectable } from '@nestjs/common';
import { FaqDto } from '@/modules/faq/models/dto/output/faq.dto';
import { FaqWithMediasDto } from '@/modules/faq/models/dto/output/faq-with-medias.dto';
import { Faq } from '@/modules/faq/models/entities/faq.entity';
import { MediaDtoMapper } from '@/modules/media/shared/mappers/media-dto.mapper';
import { PaginatedResponseDto } from '@/shared/utils/dto/pagination.dto';

@Injectable()
export class FaqDtoMapper {
	constructor(
		@Inject(MediaDtoMapper)
		private readonly mediasDtoMapper: MediaDtoMapper,
	) {}

	toFaqDto(faq: Faq): FaqDto {
		return {
			id: faq.id,
			question: faq.question,
			answer: faq.answer,
			active: faq.active,
			order: faq.order,
			createdAt: faq.createdAt,
			updatedAt: faq.updatedAt,
		};
	}
	toFaqWithMediasDto(faq: Faq): FaqWithMediasDto {
		const medias = (faq.medias ?? []).map((media) => this.mediasDtoMapper.toMediaDtoWithCompleteUrl(media));
		return {
			...this.toFaqDto(faq),
			medias,
		};
	}

	toPaginatedFaqDto(paginated: PaginatedResponseDto<Faq>): PaginatedResponseDto<FaqWithMediasDto> {
		const { data, currentPage, pageSize, totalCount, totalPages } = paginated;
		return {
			data: data.map((item) => this.toFaqWithMediasDto(item)),
			currentPage,
			pageSize,
			totalCount,
			totalPages,
		};
	}
}
