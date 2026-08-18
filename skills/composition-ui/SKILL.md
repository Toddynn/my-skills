---
name: composition-ui
description: Cards, Actions, CardUI, Triggers, formularies e modals — composition pattern Vite. Use when creating cards, composition-pattern Actions/CardUI/Triggers, domain UI in components/ui, or shadcn composition.
---

# Composition UI

## Onde vive

```
components/ui/
├── cards/{entity}-card/
├── composition-pattern/
│   ├── actions/{domain}/          → {Domain}Actions barrel
│   ├── cards/{domain}/            → {Domain}CardUI barrel
│   ├── dates/                     → DatesUI
│   └── triggers/                  → {Domain}Triggers (abre select-modals)
├── formularies/{domain}/
└── modals/{domain}/
```

Primitivos shadcn ficam em `components/ui/*.tsx` (`button`, `dialog`, `sheet`, `field`…). **Só shadcn** — sem HeroUI.

## Barrels de Actions

```ts
export const VideosActions = {
  External: {
    DeleteExternalVideo: DeleteExternalVideoAction,
    OpenEditExternalVideoModal: OpenEditExternalVideoModalAction,
    // …
  },
  Uploaded: { /* … */ },
};
```

- Arquivo da action: `open-*-modal-button.tsx`, `delete-*-button.tsx`
- Props: `Omit<ButtonProps, 'onClick'>` (+ dados da entidade)
- `children` opcional com default (ícone lucide + label/`sr-only`)
- Abrir modal: `useModalControlQuery` + `<Fragment>` → `Button` + Modal
- Delete: `useConfirm` + `useMutation` + actions hook da rota

## Barrels de CardUI

```ts
export const VideoCardUI = {
  ExternalVideo: { Preview, Iframe, SourceProvider, VideoId },
  UploadedVideo: { Preview },
};
```

- Card orquestra; subcomponentes são puros (só props)
- Um subcomponente por arquivo; card importa **só** o barrel

## Card

```tsx
export function ExternalVideoCard({ externalVideo, ...props }: Props) {
  return (
    <Card>
      <VideosActions.External.… />
      <VideoCardUI.ExternalVideo.Preview … />
      <CardFooter>
        <DatesUI.CreatedAt … />
        <DatesUI.UpdatedAt … />
      </CardFooter>
    </Card>
  );
}
```

- **Named export** obrigatório
- Sem API/mutations inline no card — só actions composition

## Formulary + Modal

- Formulary em `formularies/{domain}/` — RHF + Zod
- Modal em `modals/{domain}/` — recebe `control: ModalControlQueryControl`
- Footer do dialog injetado via prop `actions` no formulary
- Sheet/drawer: usar `components/ui/sheet` + chave URL `drawer` / `secondary-drawer` quando precisar (mesmo padrão de modal)

## Exports

- Cards, actions, formularies, modals, barrels: **named export**
- Page `Route`: named (`export const Route`)
