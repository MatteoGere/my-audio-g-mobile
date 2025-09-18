# UI Component Library

A complete set of atomic UI components for Next.js mobile applications, built with TailwindCSS and designed with a modern, clean, travel-inspired aesthetic.

## Features

- 🎨 **Travel-inspired Design**: Beautiful color palette with semantic colors (sand, sea, forest, stone)
- 📱 **Mobile-first**: Optimized for mobile experiences with responsive design
- ♿ **Accessible**: Built with accessibility in mind, including proper ARIA attributes and keyboard navigation
- 🌙 **Dark Mode**: Full support for light and dark themes
- 🎯 **TypeScript**: Fully typed with comprehensive interfaces
- 🎭 **Variants**: Multiple style variants for different use cases
- 🧩 **Composable**: Flexible component architecture for complex UIs

## Components

### Base Components

#### Button
Versatile button component with multiple variants and loading states.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

**Variants**: `primary`, `secondary`, `accent`, `outline`, `ghost`
**Sizes**: `sm`, `md`, `lg`

#### Input
Input field with icon support, error states, and labels.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  icon={<EmailIcon />}
  error="This field is required"
/>
```

#### Textarea
Multi-line text input with resize controls.

```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Description"
  resize="vertical"
  rows={4}
/>
```

### Form Components

#### Select
Dropdown select with single/multi-select support.

```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

<Select
  options={options}
  placeholder="Choose an option"
  multiple={false}
/>
```

#### Checkbox
Checkbox with label and indeterminate state support.

```tsx
import { Checkbox } from '@/components/ui';

<Checkbox
  label="Agree to terms"
  description="Check this to continue"
  indeterminate={false}
/>
```

#### Radio / RadioGroup
Radio buttons with group management.

```tsx
import { RadioGroup } from '@/components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

<RadioGroup
  name="choice"
  options={options}
  orientation="vertical"
/>
```

#### Switch
Toggle switch with light/dark mode styling.

```tsx
import { Switch } from '@/components/ui';

<Switch
  label="Enable notifications"
  size="md"
  variant="default"
/>
```

### Data Display Components

#### Badge
Status and label badges with semantic colors.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md">
  Active
</Badge>
```

**Variants**: `default`, `primary`, `secondary`, `accent`, `info`, `success`, `warning`, `error`, `outline`

#### Card
Flexible card component with header, body, footer, and image support.

```tsx
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardBody>
    Card content goes here
  </CardBody>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

#### Avatar
User avatar with fallback initials and status indicators.

```tsx
import { Avatar } from '@/components/ui';

<Avatar
  src="/user-avatar.jpg"
  alt="John Doe"
  fallback="JD"
  size="md"
  status="online"
  showStatus={true}
/>
```

#### Progress
Progress bars and loading spinners.

```tsx
import { Progress, Spinner } from '@/components/ui';

<Progress
  value={75}
  max={100}
  variant="primary"
  showValue={true}
  label="Upload Progress"
/>

<Spinner size="md" variant="primary" />
```

### Interactive Components

#### Modal / Dialog
Accessible modal dialogs with overlay and keyboard navigation.

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Modal Title"
  size="md"
  closeOnOverlayClick={true}
>
  Modal content
</Modal>
```

#### Tooltip
Hover or click tooltips with position optimization.

```tsx
import { Tooltip } from '@/components/ui';

<Tooltip
  content="This is a tooltip"
  position="top"
  trigger="hover"
>
  <span>Hover me</span>
</Tooltip>
```

#### Popover
Click or hover popovers for additional content.

```tsx
import { Popover } from '@/components/ui';

<Popover
  trigger={<button>Click me</button>}
  content={<div>Popover content</div>}
  position="bottom"
  triggerMode="click"
/>
```

#### Tabs
Tab navigation with horizontal and vertical layouts.

```tsx
import { Tabs } from '@/components/ui';

const items = [
  {
    id: 'tab1',
    label: 'Tab 1',
    content: <div>Content 1</div>,
  },
  {
    id: 'tab2',
    label: 'Tab 2',
    content: <div>Content 2</div>,
  },
];

<Tabs
  items={items}
  orientation="horizontal"
  variant="default"
/>
```

### Navigation Components

#### Breadcrumb
Navigation breadcrumbs with overflow handling.

```tsx
import { Breadcrumb } from '@/components/ui';

const items = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Current Page', current: true },
];

<Breadcrumb
  items={items}
  maxItems={3}
/>
```

#### Accordion
Collapsible content sections.

```tsx
import { Accordion } from '@/components/ui';

const items = [
  {
    id: 'item1',
    trigger: 'Section 1',
    content: 'Content for section 1',
  },
  {
    id: 'item2',
    trigger: 'Section 2',
    content: 'Content for section 2',
  },
];

<Accordion
  items={items}
  type="single"
  collapsible={true}
/>
```

#### Toast
Notification toasts with auto-dismiss and actions.

```tsx
import { ToastProvider, useToast } from '@/components/ui';

// Wrap your app with ToastProvider
<ToastProvider>
  <App />
</ToastProvider>

// Use in components
const { addToast } = useToast();

addToast({
  title: 'Success!',
  description: 'Your action was completed.',
  variant: 'success',
  duration: 5000,
});
```

## Design System

### Color Palette

The components use a travel-inspired color palette:

- **Sand**: `#faf7f2` to `#e6dcc2` - Warm, sandy tones
- **Sea**: `#f2fbfc` to `#bfe9ee` - Ocean and water tones  
- **Forest**: `#f4fbf6` to `#cfe6d0` - Natural green tones
- **Stone**: `#f6f6f6` to `#d0d0d0` - Neutral gray tones

### Semantic Colors

- **Primary**: Ocean teal (`#2b8a9e`)
- **Secondary**: Warm bronze (`#b08b57`)
- **Accent**: Soft mint (`#66c0a3`)
- **Success**: Green (`#16a34a`)
- **Warning**: Amber (`#f59e0b`)
- **Error**: Red (`#ef4444`)
- **Info**: Blue (`#3b82f6`)

### Border Radius

- **Small**: `6px`
- **Medium**: `12px`
- **Large**: `20px`
- **Full**: `9999px`

### Shadows

- **Soft**: `0 6px 18px rgba(10, 10, 10, 0.06)`
- **Medium**: `0 12px 30px rgba(10, 10, 10, 0.10)`
- **Strong**: `0 20px 50px rgba(10, 10, 10, 0.16)`

## Usage

Import components individually or use the main index:

```tsx
// Individual imports
import Button from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';

// Main index import
import { Button, Card, CardHeader } from '@/components/ui';
```

## Accessibility

All components follow accessibility best practices:

- Proper ARIA attributes
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## Dark Mode

Components automatically adapt to dark mode using CSS custom properties and Tailwind's dark mode utilities.

## Browser Support

Components are tested and supported in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Contributing

When adding new components:

1. Follow the existing naming conventions
2. Include proper TypeScript types
3. Add accessibility features
4. Support both light and dark modes
5. Include relevant variants and sizes
6. Update the index.ts file
7. Add documentation to this README