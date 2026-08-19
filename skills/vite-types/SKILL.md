---
name: vite-types
description: Interfaces base — pagination, dates, action/callback args, InferZod. Use when typing paginated API responses, action hooks args, BaseDates, InferZod, or shared interfaces.
---

# Interfaces base

## Exemplos

- [`examples/base-types.ts`](examples/base-types.ts) — pagination, dates, action args

Local: `src/shared/interfaces/`.

## Contratos obrigatórios

```ts
// default-paginated-response.ts
export interface DefaultPaginatedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  data: Array<T>;
}

// default-pagination-params.ts
export interface DefaultPaginationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// base-dates.ts
export interface BaseDates {
  createdAt: Date;
  updatedAt: Date | null;
}

// base-callback-args.ts
export interface BaseCallbackArgs<TResponse = unknown> {
  on_success?: (data?: TResponse) => void;
  on_fail?: (error?: unknown) => void;
  query_keys_to_invalidate?: QueryKey;
}

// base-action-args.ts
export interface BaseActionArgs<TForm, TResponse = unknown> extends BaseCallbackArgs<TResponse> {
  form_data: TForm;
}
```

## Uso

- Listagens paginadas: retorno `DefaultPaginatedResponse<Entity>`
- Actions hooks: args estendem `BaseActionArgs` / `BaseCallbackArgs`
- Datas de entidade: estender `BaseDates` quando aplicável
- Tipos Zod: `InferZod<typeof Schema>` (`shared/interfaces/inferzod.ts`)

## Entidades de domínio

- Tipar e exportar no `index.ts` do get correspondente (`tanstack-query/.../index.ts`)
- Form types plain TS em `routes/.../-shared/interfaces/*-form.ts` (espelham payload)

## Não fazer

- Redefinir pagination/action args locais
- `any` em respostas de API — validar/estreitar na borda
