import { NotFoundException } from '@nestjs/common';

export class NotFoundFaqException extends NotFoundException {
	constructor(fields: string) {
		super({ message: `Pergunta frequente não encontrada com os critérios: ${fields}` });
	}
}
