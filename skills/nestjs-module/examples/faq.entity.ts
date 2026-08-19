import { Column, Entity, OneToMany } from 'typeorm';
import { Media } from '@/modules/media/models/entities/media.entity';
import { env } from '@/shared/constants/env-variables';
import { TimestampedBigIntEntity } from '@/shared/entities/timestamped-bigint.entity';

@Entity({ schema: env.DB_PG_SCHEMA, name: 'frequent_asked_questions' })
export class Faq extends TimestampedBigIntEntity {
	@Column({ name: 'question' })
	question: string;

	@Column({ name: 'answer' })
	answer: string;

	@Column({ name: 'order', nullable: true })
	order: number | null;

	@Column({ name: 'active' })
	active: boolean;

	@OneToMany(
		() => Media,
		(mediaEntity: Media) => mediaEntity.faq,
	)
	medias: Media[];
}
