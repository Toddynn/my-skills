---
name: vite-zustand
description: Zustand — files, selection e visibility; quando URL vs store. Use when creating or editing Zustand stores, files-store, selection stores, list-visibility, or deciding URL query-states vs store state.
---

# Zustand stores

## Exemplos

- [`examples/files-store.ts`](examples/files-store.ts) — `useFiles` + revoke blob

Usar zustand para estado que **transita entre componentes que montam/desmontam** ou seleção efêmera de modal. Filtros/paginação/modais → **URL**.

## Stores existentes

| Store | Path | Uso |
|-------|------|-----|
| `useFiles` | `shared/stores/files-store` | uploads temporários + blob preview |
| `useRecentVideosStore` | `recent-videos-store` | últimos vídeos (persist) |
| selection stores | `select-*-store` | seleção em select-modals |
| visibility stores | `*-list-visibility-store` | collapse lista (persist) |

## Factories

- `create-selection-store` — multi/single select por `id`
- `create-persisted-list-visibility-store` — toggle + persist

Novas stores de seleção/visibilidade: **reusar factory**, não reinventar.

## Files store

```ts
export const useFiles = create<FilesStore>((set) => ({
  files: [],
  addMultipleFiles,
  updateFileById,
  removeFileById,
  clearAll, // revoga blob: URLs
}));
```

- Arquivo **não** vive no RHF como blob principal — lista real em `useFiles`
- No close do modal/upload: `clearAll()` + revoke previews
- Campo `file` opcional no schema via `FileSchema` quando o formulary precisa do binding

## URL vs Zustand

| URL (query-states) | Zustand |
|--------------------|---------|
| page, limit, search, tab, filtros | files upload |
| modal/drawer open state | seleção em select-modal |
| | UI persistida (visibility, recent) |

## Named export

`export const useFiles` / `export const useSelectMyPromptsStore` — sem default.
