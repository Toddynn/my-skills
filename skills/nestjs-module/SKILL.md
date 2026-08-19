---
name: nestjs-module
description: Estrutura de módulos NestJS (Clean Architecture). Use when creating or editing NestJS modules, DTOs, TypeORM entities, repositories, use cases, controllers, or docs.ts. Do not apply to frontend work.
---

# Estrutura de Módulos NestJS

Canônico: módulo `faq` do clube-backend. Ler **examples/** antes de gerar. **Não** inventar `useExisting` no repository.

## Exemplos

- [`examples/faq.module.ts`](examples/faq.module.ts) — `useFactory` + `DataSource`
- [`examples/faq.entity.ts`](examples/faq.entity.ts)
- [`examples/repository.interface.ts`](examples/repository.interface.ts)
- [`examples/faq.repository.ts`](examples/faq.repository.ts)
- [`examples/repository-interface-key.ts`](examples/repository-interface-key.ts)
- [`examples/get-existing-faq.use-case.ts`](examples/get-existing-faq.use-case.ts)
- [`examples/create-faq.dto.ts`](examples/create-faq.dto.ts) / [`update-faq.dto.ts`](examples/update-faq.dto.ts) / [`list-all-faqs-pagination.dto.ts`](examples/list-all-faqs-pagination.dto.ts) / [`faq.dto.ts`](examples/faq.dto.ts)
- [`examples/faq-dto.mapper.ts`](examples/faq-dto.mapper.ts) — `@Injectable()`, métodos de instância
- [`examples/not-found-faq-exception.error.ts`](examples/not-found-faq-exception.error.ts) / [`faq-already-exists-exception.error.ts`](examples/faq-already-exists-exception.error.ts)
- [`examples/create-faq.use-case.ts`](examples/create-faq.use-case.ts) / [`create-faq-admin.controller.ts`](examples/create-faq-admin.controller.ts) / [`create-faq-docs.ts`](examples/create-faq-docs.ts)
- [`examples/list-all-faqs-paginated.use-case.ts`](examples/list-all-faqs-paginated.use-case.ts) / [`list-all-faqs-paginated-public.controller.ts`](examples/list-all-faqs-paginated-public.controller.ts)

## Estrutura de Pastas

```
src/modules/<module-name>/
├── models/
│   ├── dto/input/           # create, update, pagination
│   ├── dto/output/          # respostas
│   ├── entities/            # TypeORM (plural)
│   ├── interface/
│   └── repository/
├── shared/
│   ├── constants/           # repository-interface-key
│   ├── errors/              # *.error.ts
│   └── mappers/
├── use-cases/<use-case-name>/
│   ├── <use-case-name>.use-case.ts
│   ├── <use-case-name>-admin.controller.ts
│   ├── <use-case-name>-public.controller.ts
│   └── docs.ts
└── <module-name>.module.ts
```

## Regras

- Entidade estende `TimestampedBigIntEntity`. Schema `env.DB_PG_SCHEMA`.
- Interface do repo estende `Repository<Entity>`. Extra: `listAllPaginated` etc.
- Repo injeta **só** `DataSource`. `super(Entity, dataSource.createEntityManager())`. Retorna entidades. Sem mapper/use case.
- Chave: `<ENTITY>_REPOSITORY_INTERFACE_KEY` (string `'FAQ_REPOSITORY_INTERFACE'`).
- **Módulo registra repo assim** (não `useExisting`):

```ts
{
  provide: FAQ_REPOSITORY_INTERFACE_KEY,
  useFactory: (dataSource: DataSource) => new FaqRepository(dataSource),
  inject: [DataSource],
}
```

- `forwardRef(() => OtherModule)` só se ciclo real.
- Providers: use cases + mapper. Controllers no array `controllers`.
- `exports`: chave do repo + `GetExisting<Entity>UseCase` (GetExisting **não** precisa de controller).
- Erros: `NotFound<Entity>Exception` / `<Entity>AlreadyExistsException`. Construtor recebe `fields: string`. Arquivo `*.error.ts`.
- Mapper: `@Injectable()`, injeta outros mappers se precisar. **Não** métodos `static`.
- `GetExisting` obrigatório. `normalizeGetExistingOptions` + `formatWhereClause`. Default `throwIfNotFound: true`. `{ throwIfFound: true }` no create. `{ throwIfNotFound: false, throwIfFound: false }` se `null` válido.
- Controller fala **só** com use case. Admin: `AdminSessionAuthGuard` + `AdminRolesGuard` + `@Roles(...)`. Público: `@IsPublic()`.
- DTOs: `CreateFaqDto` (sufixo `Dto`). Update = `PartialType(Create…)`. Output estende `BigintTimestampedEntityDto`.
- `docs.ts` por use-case com `ApiDocsCreate` / `ApiDocsGetPaginated` / etc.

## Nomenclatura

| Tipo | Padrão | Exemplo FAQ |
|------|--------|-------------|
| Entidade | PascalCase | `Faq` |
| Tabela | snake | `frequent_asked_questions` |
| Pasta | kebab | `faq` |
| DTO | `Create<Entity>Dto` | `CreateFaqDto` |
| Repo key | `<ENTITY>_REPOSITORY_INTERFACE_KEY` | `FAQ_REPOSITORY_INTERFACE_KEY` |
| Use case | `<Action><Entity>UseCase` | `GetExistingFaqUseCase` |
| Controller | `<Action><Entity><Role>Controller` | `CreateFaqAdminController` |
| Mapper | `<Entity>DtoMapper` | `FaqDtoMapper` |
| Pasta use-case | kebab verbo+entidade | `get-existing-faq` |

## Checklist

- [ ] Entity `TimestampedBigIntEntity` + `models/entities/`
- [ ] Interface estende `Repository<Entity>`
- [ ] Repo só `DataSource`, entidades puras
- [ ] `useFactory` + inject `DataSource` (nunca `useExisting`)
- [ ] Erros `*.error.ts` + mapper `@Injectable()`
- [ ] `GetExisting` + export no module
- [ ] DTOs `input/` `output/`
- [ ] Guards + só use cases no controller
- [ ] `docs.ts` no use-case
