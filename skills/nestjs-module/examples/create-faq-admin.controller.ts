import { Body, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateFaqDto } from '@/modules/faq/models/dto/input/create-faq.dto';
import { Roles } from '@/modules/keycloak-auth/models/decorators/roles.decorator';
import { AdminRolesGuard } from '@/modules/keycloak-auth/models/guards/admin-roles.guard';
import { AdminSessionAuthGuard } from '@/modules/keycloak-auth/models/guards/admin-session-auth.guard';
import { ADMIN_ROLES } from '@/modules/keycloak-auth/shared/constants/keycloak-roles.constant';
import { CreateFaqUseCase } from './create-faq.use-case';
import { CreateFaqAdminDocs } from './docs';

@ApiTags('Admin - Frequent Asked Questions')
@UseGuards(AdminSessionAuthGuard, AdminRolesGuard)
@Roles(ADMIN_ROLES.CREATE_FAQS)
@Controller('admin/faqs')
export class CreateFaqAdminController {
	constructor(private readonly createFaqUseCase: CreateFaqUseCase) {}

	@CreateFaqAdminDocs()
	@Post()
	@UseInterceptors(FilesInterceptor('archives', 10))
	@ApiConsumes('multipart/form-data')
	async execute(@Body() faqDTO: CreateFaqDto, @UploadedFiles() archives: Express.Multer.File[]) {
		return await this.createFaqUseCase.execute(faqDTO, archives);
	}
}
