import { Inject, Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { Faq } from '@/modules/faq/models/entities/faq.entity';
import { FaqRepositoryInterface } from '@/modules/faq/models/interface/repository.interface';
import { FAQ_REPOSITORY_INTERFACE_KEY } from '@/modules/faq/shared/constants/repository-interface-key';
import { FaqAlreadyExistsException } from '@/modules/faq/shared/errors/faq-already-exists-exception.error';
import { NotFoundFaqException } from '@/modules/faq/shared/errors/not-found-faq-exception.error';
import { formatWhereClause } from '@/shared/helpers/format-where-clause.helper';
import { normalizeGetExistingOptions } from '@/shared/helpers/normalize-get-existing-options.helper';
import { GetExistingOptions } from '@/shared/interfaces/get-existing-options';

@Injectable()
export class GetExistingFaqUseCase {
	constructor(
		@Inject(FAQ_REPOSITORY_INTERFACE_KEY)
		private readonly faqsRepository: FaqRepositoryInterface,
	) {}

	async execute(criteria: FindOneOptions<Faq>, options?: GetExistingOptions): Promise<Faq | null> {
		const { throwIfFound, throwIfNotFound } = normalizeGetExistingOptions(options);
		const fields = formatWhereClause(criteria.where || {});

		const FaqEntity = await this.faqsRepository.findOne(criteria);

		if (!FaqEntity) {
			if (throwIfNotFound) {
				throw new NotFoundFaqException(fields);
			}
			return null;
		}

		if (throwIfFound) {
			throw new FaqAlreadyExistsException(fields);
		}

		return FaqEntity;
	}
}
