import { ConflictException } from '@nestjs/common';

export class FaqAlreadyExistsException extends ConflictException {
	constructor(fields: string) {
		super({ message: `Pergunta frequente já existe com os critérios: ${fields}.` });
	}
}
