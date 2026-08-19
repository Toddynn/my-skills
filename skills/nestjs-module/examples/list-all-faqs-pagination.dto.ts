import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { toBoolean } from '@/shared/decorators/boolean-transform.decorator';
import { PaginationDto } from '@/shared/utils/dto/pagination.dto';

export class ListAllFaqsPaginationDto extends PaginationDto {
	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	@Min(0)
	order?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	@Transform(toBoolean)
	active?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	createdAt?: string;
}
