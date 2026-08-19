import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BigintTimestampedEntityDto } from '@/shared/utils/dto/bigint-timestamped-entity.dto';

export class FaqDto extends BigintTimestampedEntityDto {
	@ApiProperty({ description: 'Pergunta frequente' })
	@IsString()
	@IsNotEmpty()
	question: string;

	@ApiProperty({ description: 'Resposta' })
	@IsString()
	@IsNotEmpty()
	answer: string;

	@ApiPropertyOptional({ description: 'Ordem' })
	@IsNumber()
	@IsOptional()
	order: number | null;

	@ApiProperty({ description: 'Ativo' })
	@IsBoolean()
	@IsNotEmpty()
	active: boolean;
}
