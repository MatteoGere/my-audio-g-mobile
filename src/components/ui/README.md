# UI components

This package contains the atomic UI components used in the Next.js app (folder `src/components/ui`). This README is a short overview: the actual components, recommended imports, and practical notes about styling and accessibility.

## Included components

The folder contains the following components (exported from `index.ts`):

- `Accordion`
- `Avatar`
- `Badge`
- `Breadcrumb`
- `Button`
- `Card`
- `Checkbox`
- `Input`
- `Modal`
- `Popover`
- `Progress`
- `Radio`
- `Select`
- `Switch`
- `Tabs`
- `Textarea`
- `Toast` (provider / hook)
- `Tooltip`

Use the `index.ts` to import single components or groups:

```tsx
import { Button, Input, ToastProvider } from '@/components/ui';
```

## Quick examples

- Button:

```tsx
<Button variant="primary">Open</Button>
```

- Input with label/error (generic example):

```tsx
<Input label="Email" placeholder="name@example.com" error={emailError} />
```

- Toast (wrap your app with the provider):

```tsx
<ToastProvider>
  <App />
</ToastProvider>
// then in a component: const { addToast } = useToast();
```

Other components follow similar conventions: props for variants/sizes, error state support, and simple APIs for integration.

## Styling and design system

- Project is based on Tailwind CSS; components use utility classes and variables for theming and dark mode.
- Palette and style details are defined centrally in the project theme (see `src/design/tokens.ts` and `tailwind.config.ts`). Avoid hard-coding colors inside components.

## Accessibility

- Components are designed with accessibility in mind: ARIA attributes where appropriate, focus management, and keyboard navigation.
- When adding new components or variants, keep these practices and add manual tests with screen readers.

## Icons

- Prefer `react-icons` (for example `react-icons/hi2`) for decorative/action icons. Import icons and style them with Tailwind classes.

## Contributing

- Add new components to `src/components/ui/` and update `index.ts` to export them.
- Include TypeScript types, visual checks and accessibility checks when possible.

---

If you want, I can generate a small playground page (a simple story or demo page at `src/app/ui-playground`) that showcases all components with different props. Do you want me to create it now?
