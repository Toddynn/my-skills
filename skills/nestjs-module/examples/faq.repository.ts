import { BadRequestException, Injectable } from '@nestjs/common';
import { endOfDay, isValid, parse, startOfDay } from 'date-fns';
import { type DataSource, Repository } from 'typeorm';
import { PaginatedResponseDto } from '@/shared/utils/dto/pagination.dto';
import { ListAllFaqsPaginationDto } from '../dto/input/list-all-faqs-pagination.dto';
import { Faq } from '../entities/faq.entity';
import { FaqRepositoryInterface } from '../interface/repository.interface';

@Injectable()
export class FaqRepository extends Repository<Faq> implements FaqRepositoryInterface {
	constructor(dataSource: DataSource) {
		super(Faq, dataSource.createEntityManager());
	}

	async listAllPaginated(paginationDto: ListAllFaqsPaginationDto): Promise<PaginatedResponseDto<Faq>> {
		let parsedDate: Date | undefined;

		if (paginationDto.createdAt) {
			parsedDate = parse(paginationDto.createdAt, 'yyyy-MM-dd', new Date());
			if (!isValid(parsedDate)) {
				parsedDate = parse(paginationDto.createdAt, 'dd-MM-yyyy', new Date());
			}

			if (!isValid(parsedDate)) {
				throw new BadRequestException('Formato de data inválido. Use "YYYY-MM-DD" ou "DD-MM-YYYY".');
			}
		}

		const queryBuilder = this.createQueryBuilder('faq');

		if (paginationDto.search && paginationDto.search.trim() !== '') {
			queryBuilder.andWhere(`(faq.question ILIKE :search OR faq.answer ILIKE :search)`, { search: `%${paginationDto.search}%` });
		}

		if (paginationDto.active !== undefined) {
			queryBuilder.andWhere('faq.active = :active', { active: paginationDto.active });
		}

		if (parsedDate) {
			queryBuilder.andWhere('faq.createdAt BETWEEN :startOfDay AND :endOfDay', {
				startOfDay: startOfDay(parsedDate),
				endOfDay: endOfDay(parsedDate),
			});
		}

		queryBuilder.orderBy('faq.order', 'ASC');

		const page = paginationDto.page || 1;
		const quantity = paginationDto.quantity || 10;

		queryBuilder.skip((page - 1) * quantity).take(quantity);

		queryBuilder.leftJoinAndSelect('faq.medias', 'medias');

		const [data, totalCount] = await queryBuilder.getManyAndCount();

		let totalPages = Math.ceil(totalCount / quantity);
		if (totalPages === 0) {
			totalPages = 1;
		}
		return { data, currentPage: page, totalPages, totalCount, pageSize: quantity };
	}
}
