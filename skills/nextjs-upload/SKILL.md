---
name: nextjs-upload
description: Upload de mídia, zustand e ProgressModal para módulos admin com arquivos. Use when adding file upload, FormData multipart, useFiles/useMedias, FileUploader, or ProgressModal in Next.js admin CRUD modules.
---

# Mídia e upload — módulos com arquivos

Aplicar em módulos com arquivo (posts, products, banner-set, **faq**). JSON puro: pular.

## Exemplos

- [`examples/build-form-data.ts`](examples/build-form-data.ts)
- [`examples/use-upload-progress-modal.ts`](examples/use-upload-progress-modal.ts) — copiar `hooks/use-upload-progress-modal`
- [`examples/progress-modal.tsx`](examples/progress-modal.tsx) — copiar `components/ui/progress-modal`

Drawer FAQ de referência: `nextjs-composition` [`create-faq-drawer.tsx`](../nextjs-composition/examples/create-faq-drawer.tsx).

## Estado

| Store | Uso |
|-------|-----|
| `useFiles` | arquivos novos create/edit |
| `useMedias` | mídias existentes no edit |

Arquivo **não** é o blob principal do `useForm`. Lista real: `files` zustand → `archives` no actions hook.

## Drawer + ProgressModal

```ts
const { cancel_upload, control, on_progress_modal_close } = useUploadProgressModal({
  isUploading: is_pending,
  abortControllerRef: actions.abort_controller_ref,
  key: '{prefix}_progress',
});
```

- `isUploading` true → abre URL (`set(true)`). False → fecha após min 500ms visível.
- `cancel_upload` aborta `AbortController` + fecha.
- Success: `on_progress_modal_close()` + `handleClose()`.
- Fail: `on_fail_callback={on_progress_modal_close}`.
- `<ProgressModal control={progress_control} isLoading={is_pending} progress={actions.request_progress} onCancelRequest={cancel_upload} />`
- Close do sheet bloqueado se `is_pending`. Revoke `URL.createObjectURL` + `clearAll()`.

`ProgressModal`: Dialog; não fecha com X enquanto `isLoading`; botão cancel só com upload ativo.

## Actions multipart

`FormData` + `multipart_form_header` + `onUploadProgress` → `setRequestProgress`. `appendArchives`. Signal do abort controller.

## Formulary

Create: `FileUploader` no `Controller` `name="file"`. Edit: `useMedias` + `AddedMedias` + novos via `useFiles`.
