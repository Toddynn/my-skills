import { Inject, Injectable } from '@nestjs/common';
import { CreateFaqDto } from '@/modules/faq/models/dto/input/create-faq.dto';
import { FaqRepositoryInterface } from '@/modules/faq/models/interface/repository.interface';
import { FAQ_REPOSITORY_INTERFACE_KEY } from '@/modules/faq/shared/constants/repository-interface-key';
import { CreateMediaDTO } from '@/modules/media/models/dto/input/create-media.dto';
import { CreateMediaUseCase } from '@/modules/media/use-cases/create-media/create-media.use-case';
import { AppCacheService } from '@/shared/cache/app-cache.service';
import { invalidateFaqCaches } from '@/shared/cache/invalidate-catalog-cache.helper';

@Injectable()
export class CreateFaqUseCase {
	constructor(
		@Inject(FAQ_REPOSITORY_INTERFACE_KEY)
		private readonly faqRepository: FaqRepositoryInterface,
		@Inject(CreateMediaUseCase)
		private readonly createMediaUseCase: CreateMediaUseCase,
		private readonly appCacheService: AppCacheService,
	) {}

	async execute(faqDTO: CreateFaqDto, archives: Express.Multer.File[]) {
		const { icon, redirectUrl, ...faqDTOWithoutIcon } = faqDTO;

		const createdFaq = this.faqRepository.create(faqDTOWithoutIcon);
		await this.faqRepository.save(createdFaq);

		await Promise.all(
			archives.map((file, index) => {
				const media: CreateMediaDTO = {
					name: file.originalname,
					mimetype: file.mimetype,
					size: file.size,
					redirectUrl: redirectUrl ? redirectUrl[index] : undefined,
					icon: icon[index],
					faqId: createdFaq.id,
				};
				return this.createMediaUseCase.execute(media, file);
			}),
		);
		await invalidateFaqCaches(this.appCacheService);
		return createdFaq;
	}
}
