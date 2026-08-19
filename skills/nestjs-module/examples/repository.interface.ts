import { Repository, UpdateResult } from 'typeorm';
import { PaginatedResponseDto } from '@/shared/utils/dto/pagination.dto';
import { ListAllFaqsPaginationDto } from '../dto/input/list-all-faqs-pagination.dto';
import { UpdateFaqDto } from '../dto/input/update-faq.dto';
import { Faq } from '../entities/faq.entity';

export interface FaqRepositoryInterface extends Repository<Faq> {
	listAllPaginated(paginationDto: ListAllFaqsPaginationDto): Promise<PaginatedResponseDto<Faq>>;
	update(faqId: string, faqDTO: UpdateFaqDto): Promise<UpdateResult>;
}
