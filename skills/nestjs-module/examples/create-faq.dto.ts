import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CreateMediaJobDto } from '@/modules/media/models/dto/input/create-media-job.dto';
import { toBoolean } from '@/shared/decorators/boolean-transform.decorator';

export class CreateFaqDto extends CreateMediaJobDto {
	@ApiProperty({ required: true })
	@IsNotEmpty()
	@IsString()
	question: string;

	@ApiProperty({ required: true })
	@IsNotEmpty()
	@IsString()
	answer: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	@Transform(({ value }) => Number(value))
	@Min(0)
	order?: number;

	@ApiProperty({ required: true })
	@IsNotEmpty()
	@IsBoolean()
	@Transform(toBoolean)
	active: boolean;
}
