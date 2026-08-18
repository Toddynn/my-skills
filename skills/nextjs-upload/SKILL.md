---
name: nextjs-upload
description: Upload de mídia, zustand e ProgressModal para módulos admin com arquivos. Use when adding file upload, FormData multipart, useFiles/useMedias, FileUploader, or ProgressModal in Next.js admin CRUD modules.
---

# Mídia e upload — módulos com arquivos

Aplicar em: **posts**, **products**, **banner-set**. Não aplicar em **rankings** (JSON puro).

## Estado de arquivos

| Store | Uso |
|-------|-----|
| `useFiles` | arquivos novos no create/edit |
| `useMedias` | mídias existentes no edit |

- Arquivo **não** vai no `useForm` como blob principal — campo `file` opcional no schema form-fields via `FileSchema`.
- Lista real de uploads: `files` do zustand, mapeada para `archives` no actions hook.

## Formulary — create

- `FileUploader` dentro de `Controller` (`name="file"`).
- `acceptedTypes`: `image_types` (+ `video_types` em banner-set).
- `maxSize`: constante local (ex.: `20 * 1024 * 1024`).
- `onFileChange` → `field.onChange(file)`.

## Formulary — edit

- `useMedias`: `setMedias(entity.medias)` no `useEffect`.
- `AddedMedias` para exibir/remover existentes.
- `delete_media` via mutation inline + `removeMediaById`.
- Novos arquivos ainda via `useFiles` + `FileUploader`.

## Actions hook — multipart

```ts
const archives = files.map(({ file, icon }) => ({ icon, archive: file }));
const parsed = await CreateSchema.parseAsync({ ...form_fields, archives });
const formData = buildCreateFormData(parsed);
await api.post(route, formData, {
  ...multipart_form_header,
  signal: abort_controller_ref.current?.signal,
  onUploadProgress: (e) => setRequestProgress(...),
});
```

- `appendArchives`: `archives`, `icon`, `redirectUrl` (banner-set).
- Edit: só append campos presentes no parsed.

## Drawer — lifecycle

**Create close:** revoke `URL.createObjectURL` de cada file + `clearAll()`.

**Edit close:** revoke files + `clearAllFiles()` + `clearAllMedias()`.

**Bloqueio:** não fechar sheet se `is_pending`.

## ProgressModal

```ts
const { cancel_upload, control, on_progress_modal_close } = useUploadProgressModal({
  isUploading: is_pending,
  abortControllerRef: actions.abort_controller_ref,
  key: '{prefix}_progress',
});
```

- Drawer passa `on_fail_callback={on_progress_modal_close}`.
- Success: `on_progress_modal_close()` + `handleClose()`.
- `ProgressModal`: `progress={actions.request_progress}`, `onCancelRequest={cancel_upload}`.

## Banner-set específico

- Vídeo permitido; `redirectUrl` em archives.
- Pode forçar `active: false` sem mídia no create.

## Products específico

- `update_media_icon` para toggle em mídia existente.
- Modal de usuários elegíveis com search params próprios.
