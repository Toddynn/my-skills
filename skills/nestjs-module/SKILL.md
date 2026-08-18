---
name: nestjs-module
description: Estrutura de módulos NestJS (Clean Architecture). Use when creating or editing NestJS modules, DTOs, TypeORM entities, repositories, use cases, controllers, or docs.ts. Do not apply to frontend work.
---

# Estrutura de Módulos NestJS

Este projeto segue uma arquitetura modular baseada em Clean Architecture com separação clara de responsabilidades.

## Estrutura de Pastas

```
src/<module-name>/
├── models/
│   ├── dto/
│   │   ├── input/           # DTOs de entrada (create, update, pagination)
│   │   └── output/          # DTOs de saída (respostas da API)
│   ├── entities/              # Entidades TypeORM
│   ├── interface/           # Interfaces do repositório
│   └── repository/          # Implementação do repositório
├── shared/
│   ├── constants/           # Chaves de injeção de dependência
│   ├── errors/              # Exceções de domínio específicas
│   └── mappers/             # Mapeadores Entity → DTO
├── use-cases/
│   └── <use-case-name>/
│       ├── <use-case-name>.use-case.ts
│       ├── <use-case-name>-admin.controller.ts
│       ├── <use-case-name>-partner.controller.ts
│       └── docs.ts
└── <module-name>.module.ts
```

## DTOs

### Input DTOs (Manipulação)

```typescript
// create-<entity>.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Create<Entity>DTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  field: string;
}
```

```typescript
// update-<entity>.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { Create<Entity>DTO } from './create-<entity>.dto';

export class Update<Entity>DTO extends PartialType(Create<Entity>DTO) {}
```

```typescript
// list-all-<entity>-pagination.dto.ts
import { PaginationDto } from 'src/shared/utils/dto/pagination.dto';

export class ListAll<Entity>PaginationDto extends PaginationDto {
  // Filtros específicos do domínio
}
```

### Output DTOs (Respostas)

```typescript
// <entity>.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BigintTimestampedEntityDto } from 'src/shared/utils/dto/bigint-timestamped-entity.dto';

export class <Entity>DTO extends BigintTimestampedEntityDto {
  @ApiProperty({
    description: 'Descrição do campo',
    example: 'valor exemplo',
  })
  field: string;
}
```

## Entidades

Sempre estender da entidade base apropriada:

```typescript
import { TimestampedBigIntEntity } from 'src/shared/entities/timestamped-bigint.entity';
import { env } from 'src/shared/constants/env-variables';
import { Entity, Column } from 'typeorm';

@Entity({ schema: env.DB_PG_SCHEMA, name: 'nome-tabela' })
export class <Entity> extends TimestampedBigIntEntity {
  @Column({ name: 'coluna_db', type: 'varchar' })
  field: string;
}
```

## Interface do Repositório

Estender do `Repository<T>` genérico do TypeORM para herdar métodos padrão:

```typescript
// repository.interface.ts
import { Repository } from 'typeorm';
import { <Entity> } from '../entity/<entity>.entity';
import { PaginatedResponseDto } from 'src/shared/utils/dto/pagination.dto';

export interface <Entity>RepositoryInterface extends Repository<<Entity>> {
  listAllPaginated(dto: ListAll<Entity>PaginationDto): Promise<PaginatedResponseDto<<Entity>>>;
}
```

## Implementação do Repositório

- **NUNCA** conhecer outras camadas (mappers, use cases, controllers)
- **SEMPRE** retornar entidades puras
- **SEMPRE** injetar apenas `DataSource`

```typescript
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { <Entity> } from '../entity/<entity>.entity';
import { <Entity>RepositoryInterface } from '../interface/repository.interface';

@Injectable()
export class <Entity>Repository extends Repository<<Entity>> implements <Entity>RepositoryInterface {
  constructor(dataSource: DataSource) {
    super(<Entity>, dataSource.createEntityManager());
  }

  async listAllPaginated(dto): Promise<PaginatedResponseDto<<Entity>>> {
    // Implementação retornando ENTIDADES puras
  }
}
```

## Chave do Repositório

```typescript
// shared/constants/repository-interface-key.ts
export const <ENTITY>_REPOSITORY_KEY = '<ENTITY>_REPOSITORY_KEY';
```

## Erros de Domínio

Criar exceções específicas para facilitar documentação:

```typescript
// shared/errors/not-found-<entity>-exception.ts
import { NotFoundException } from '@nestjs/common';

export class NotFound<Entity>Exception extends NotFoundException {
  constructor(fields: string) {
    super({
      message: '<Entity> não encontrado',
      fields,
    });
  }
}
```

```typescript
// shared/errors/<entity>-already-exists.exception.ts
import { ConflictException } from '@nestjs/common';

export class <Entity>AlreadyExistsException extends ConflictException {
  constructor() {
    super({
      message: '<Entity> já existe',
    });
  }
}
```

## Mappers

Garantir tipagem end-to-end entre Entity e DTO:

```typescript
// shared/mappers/<entity>-dto.mapper.ts
import { <Entity>DTO } from '../../models/dto/output/<entity>.dto';
import { <Entity> } from '../../models/entity/<entity>.entity';
import { PaginatedResponseDto } from 'src/shared/utils/dto/pagination.dto';

export class <Entity>DtoMapper {
  static to<Entity>Dto(entity: <Entity>): <Entity>DTO {
    return {
      id: entity.id,
      field: entity.field,
      createdAt: entity.created_at,
      updatedAt: entity.updated_at,
    };
  }

  static toPaginated<Entity>Dto(
    entities: <Entity>[],
    pagination: { totalCount: number; pageSize: number; currentPage: number; totalPages: number }
  ): PaginatedResponseDto<<Entity>DTO> {
    return {
      data: entities.map(this.to<Entity>Dto),
      ...pagination,
    };
  }
}
```

## Use Case GetExisting (OBRIGATÓRIO)

**SEMPRE** criar um use case `get-existing-<entity>` para evitar chamadas diretas a `findOne`, `findById`, etc.

**Comportamento padrão:** `throwIfNotFound: true` - não precisa passar explicitamente. Só passe options quando quiser comportamento diferente:
- `{ throwIfFound: true }` - para verificar se já existe (ex: antes de criar)
- `{ throwIfNotFound: false, throwIfFound: false }` - quando null é um resultado válido (atentar-se ao comportamento padrão da função que inverte o outro caso em cenários onde apenas uma propriedade é passada)

```typescript
// use-cases/get-existing-<entity>/get-existing-<entity>.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { FindOneOptions } from 'typeorm';
import { <Entity> } from '../../models/entity/<entity>.entity';
import { <Entity>RepositoryInterface } from '../../models/interface/repository.interface';
import { <ENTITY>_REPOSITORY_KEY } from '../../shared/constants/repository-interface-key';
import { NotFound<Entity>Exception } from '../../shared/errors/not-found-<entity>-exception';
import { <Entity>AlreadyExistsException } from '../../shared/errors/<entity>-already-exists.exception';
import { GetExistingOptions } from 'src/shared/interfaces/get-existing-options';
import { normalizeGetExistingOptions } from 'src/shared/helpers/normalize-get-existing-options.helper';
import { formatWhereClause } from 'src/shared/helpers/format-where-clause.helper';

@Injectable()
export class GetExisting<Entity>UseCase {
  constructor(
    @Inject(<ENTITY>_REPOSITORY_KEY)
    private readonly repository: <Entity>RepositoryInterface,
  ) {}

  async execute(
    criteria: FindOneOptions<<Entity>>,
    options?: GetExistingOptions
  ): Promise<<Entity> | null> {
    const { throwIfFound, throwIfNotFound } = normalizeGetExistingOptions(options);
    const fields = formatWhereClause(criteria.where || {});

    const entity = await this.repository.findOne(criteria);

    if (!entity) {
      if (throwIfNotFound) {
        throw new NotFound<Entity>Exception(fields);
      }
      return null;
    }

    if (throwIfFound) {
      throw new <Entity>AlreadyExistsException();
    }

    return entity;
  }
}
```

## Controllers

- Comunicar **APENAS** com use cases
- Fazer mapeamento Entity → DTO usando mappers
- Usar guards apropriados (`AdminSessionAuthGuard`, `PartnerSessionAuthGuard`)

```typescript
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminSessionAuthGuard } from 'src/keycloak-auth/models/guards/admin-session-auth.guard';
import { GetExisting<Entity>UseCase } from './get-existing-<entity>.use-case';
import { GetExisting<Entity>Docs } from './docs';
import { <Entity>DtoMapper } from '../../shared/mappers/<entity>-dto.mapper';
import { <Entity>DTO } from '../../models/dto/output/<entity>.dto';

@ApiTags('Admin - <Entity>')
@UseGuards(AdminSessionAuthGuard)
@Controller('admin/<entity-plural>')
export class GetExisting<Entity>AdminController {
  constructor(
    private readonly getExisting<Entity>UseCase: GetExisting<Entity>UseCase,
  ) {}

  @GetExisting<Entity>Docs()
  @Get(':id')
  async execute(@Param('id') id: string): Promise<<Entity>DTO> {
    // Não precisa passar { throwIfNotFound: true } - é o padrão
    const entity = await this.getExisting<Entity>UseCase.execute({ where: { id } });
    return <Entity>DtoMapper.to<Entity>Dto(entity);
  }
}
```

## Documentação (docs.ts)

Sempre documentar erros de domínio usando os helpers:

```typescript
// docs.ts
import { <Entity>DTO } from '../../models/dto/output/<entity>.dto';
import { Create<Entity>DTO } from '../../models/dto/input/create-<entity>.dto';
import { NotFound<Entity>Exception } from '../../shared/errors/not-found-<entity>-exception';
import { <Entity>AlreadyExistsException } from '../../shared/errors/<entity>-already-exists.exception';
import { 
  ApiDocsCreate, 
  ApiDocsUpdate,
  ApiDocsDelete,
  ApiDocsGetOne,
  ApiDocsGetPaginated,
  NotFound, 
  Conflict 
} from 'src/shared/helpers/api-docs';

export function Create<Entity>AdminDocs() {
  return ApiDocsCreate(
    'Criar <entity>',
    Create<Entity>DTO,
    <Entity>DTO,
    [Conflict(<Entity>AlreadyExistsException)],
  );
}

export function GetExisting<Entity>Docs() {
  return ApiDocsGetOne(
    'Buscar <entity> existente',
    <Entity>DTO,
    [NotFound(NotFound<Entity>Exception, 'id=123')],
  );
}

export function ListAll<Entity>AdminDocs() {
  return ApiDocsGetPaginated('Listar <entities>', <Entity>DTO);
}

export function Update<Entity>AdminDocs() {
  return ApiDocsUpdate(
    'Atualizar <entity>',
    Update<Entity>DTO,
    [NotFound(NotFound<Entity>Exception, 'id=123')],
  );
}

export function Delete<Entity>AdminDocs() {
  return ApiDocsDelete(
    'Excluir <entity>',
    [NotFound(NotFound<Entity>Exception, 'id=123')],
  );
}
```

## Módulo

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <Entity> } from './models/entity/<entity>.entity';
import { <Entity>Repository } from './models/repository/<entity>.repository';
import { <ENTITY>_REPOSITORY_KEY } from './shared/constants/repository-interface-key';
// Use cases e Controllers...

@Module({
  imports: [TypeOrmModule.forFeature([<Entity>])],
  controllers: [/* Controllers */],
  providers: [
    /* Use Cases */
    <Entity>Repository,
    { provide: <ENTITY>_REPOSITORY_KEY, useExisting: <Entity>Repository },
  ],
  exports: [<ENTITY>_REPOSITORY_KEY],
})
export class <Entity>Module {}
```

## Nomenclatura Padrão

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Entidade | `PascalCase` | `PointEvent` |
| Tabela DB | `snake-case` | `evento_pontos` |
| Pasta módulo | `kebab-case` | `point-event` |
| DTO Input | `Create<Entity>DTO`, `Update<Entity>DTO` | `CreatePointEventDTO` |
| DTO Output | `<Entity>DTO` | `PointEventDTO` |
| Repository Key | `<ENTITY>_REPOSITORY_KEY` | `POINT_EVENT_REPOSITORY_KEY` |
| Use Case | `<Action><Entity>UseCase` | `GetExistingPointEventUseCase` |
| Controller | `<Action><Entity><Role>Controller` | `CreatePointEventAdminController` |
| Exception NotFound | `NotFound<Entity>Exception` | `NotFoundPointEventException` |
| Exception Conflict | `<Entity>AlreadyExistsException` | `PointEventAlreadyExistsException` |
| Mapper | `<Entity>DtoMapper` | `PointEventDtoMapper` |
| Pasta use-case | `kebab-case` do verbo + entidade | `get-existing-point-event` |

## Checklist para Novo Módulo

- [ ] Entidade estende `TimestampedBigIntEntity`
- [ ] Interface do repositório estende `Repository<Entity>`
- [ ] Repositório só conhece `DataSource`, retorna entidades puras
- [ ] Chave do repositório criada em `shared/constants/`
- [ ] Erros de domínio específicos em `shared/errors/`
- [ ] Mapper em `shared/mappers/`
- [ ] `GetExisting<Entity>UseCase` implementado
- [ ] DTOs separados em `input/` e `output/`
- [ ] Controllers usam guards e chamam apenas use cases
- [ ] Documentação com `docs.ts` documentando erros de domínio
- [ ] Módulo registra repositório com chave de injeção
