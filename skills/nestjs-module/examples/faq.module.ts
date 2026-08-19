import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MediaModule } from '@/modules/media/media.module';
import { Faq } from './models/entities/faq.entity';
import { FaqRepository } from './models/repository/faq.repository';
import { FAQ_REPOSITORY_INTERFACE_KEY } from './shared/constants/repository-interface-key';
import { FaqDtoMapper } from './shared/mappers/faq-dto.mapper';
import { CreateFaqUseCase } from './use-cases/create-faq/create-faq.use-case';
import { CreateFaqAdminController } from './use-cases/create-faq/create-faq-admin.controller';
import { DeleteFaqUseCase } from './use-cases/delete-faq/delete-faq.use-case';
import { DeleteFaqAdminController } from './use-cases/delete-faq/delete-faq-admin.controller';
import { FindFaqWithMediasUseCase } from './use-cases/find-faq-with-medias/find-faq-with-medias.use-case';
import { FindFaqWithMediasAdminController } from './use-cases/find-faq-with-medias/find-faq-with-medias-admin.controller';
import { FindFaqWithMediasPublicController } from './use-cases/find-faq-with-medias/find-faq-with-medias-public.controller';
import { GetExistingFaqUseCase } from './use-cases/get-existing-faq/get-existing-faq.use-case';
import { ListAllFaqsPaginatedUseCase } from './use-cases/list-all-faqs-paginated/list-all-faqs-paginated.use-case';
import { ListAllFaqsPaginatedPublicController } from './use-cases/list-all-faqs-paginated/list-all-faqs-paginated-public.controller';
import { UpdateFaqUseCase } from './use-cases/update-faq/update-faq.use-case';
import { UpdateFaqAdminController } from './use-cases/update-faq/update-faq-admin.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Faq]), forwardRef(() => MediaModule)],
	controllers: [
		CreateFaqAdminController,
		FindFaqWithMediasPublicController,
		FindFaqWithMediasAdminController,
		ListAllFaqsPaginatedPublicController,
		UpdateFaqAdminController,
		DeleteFaqAdminController,
	],
	providers: [
		{
			provide: FAQ_REPOSITORY_INTERFACE_KEY,
			useFactory: (dataSource: DataSource) => {
				return new FaqRepository(dataSource);
			},
			inject: [DataSource],
		},
		CreateFaqUseCase,
		ListAllFaqsPaginatedUseCase,
		UpdateFaqUseCase,
		DeleteFaqUseCase,
		GetExistingFaqUseCase,
		FindFaqWithMediasUseCase,
		FaqDtoMapper,
	],
	exports: [FAQ_REPOSITORY_INTERFACE_KEY, GetExistingFaqUseCase],
})
export class FaqModule {}
