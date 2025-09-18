'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  RadioGroup,
  Switch,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  CardFooter,
  Avatar,
  Progress,
  Spinner,
  Modal,
  Tooltip,
  Popover,
  Tabs,
  Breadcrumb,
  Accordion,
  ToastProvider,
  useToast,
} from '@/components/ui';

// Sample data
const selectOptions = [
  { value: 'option1', label: 'First Option' },
  { value: 'option2', label: 'Second Option' },
  { value: 'option3', label: 'Third Option', disabled: true },
];

const radioOptions = [
  { value: 'radio1', label: 'Radio Option 1', description: 'Description for option 1' },
  { value: 'radio2', label: 'Radio Option 2', description: 'Description for option 2' },
  { value: 'radio3', label: 'Radio Option 3', disabled: true },
];

const tabItems = [
  {
    id: 'tab1',
    label: 'Overview',
    content: <div className="p-4">This is the overview tab content with some example text.</div>,
  },
  {
    id: 'tab2',
    label: 'Details',
    content: <div className="p-4">Here are the detailed information and specifications.</div>,
  },
  {
    id: 'tab3',
    label: 'Reviews',
    content: <div className="p-4">Customer reviews and feedback would be displayed here.</div>,
  },
];

const breadcrumbItems = [
  { label: 'Home', href: '/' },
  { label: 'Components', href: '/components' },
  { label: 'UI Playground', current: true },
];

const accordionItems = [
  {
    id: 'accordion1',
    trigger: 'What is this component library?',
    content:
      'This is a comprehensive set of atomic UI components built for Next.js applications with a travel-inspired design system.',
  },
  {
    id: 'accordion2',
    trigger: 'How do I use these components?',
    content:
      'Import the components you need from the ui library and use them in your React components. Each component comes with TypeScript support and multiple variants.',
  },
  {
    id: 'accordion3',
    trigger: 'Are the components accessible?',
    content:
      'Yes! All components follow accessibility best practices including proper ARIA attributes, keyboard navigation, and screen reader support.',
  },
];

const ToastDemo = () => {
  const { addToast } = useToast();

  const showToast = (variant: 'success' | 'error' | 'warning' | 'info' | 'default') => {
    addToast({
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
      description: `This is a ${variant} toast notification.`,
      variant,
      duration: 4000,
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold mb-4">Toast Notifications</h3>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => showToast('success')}>
          Success Toast
        </Button>
        <Button variant="secondary" size="sm" onClick={() => showToast('error')}>
          Error Toast
        </Button>
        <Button variant="accent" size="sm" onClick={() => showToast('warning')}>
          Warning Toast
        </Button>
        <Button variant="outline" size="sm" onClick={() => showToast('info')}>
          Info Toast
        </Button>
        <Button variant="ghost" size="sm" onClick={() => showToast('default')}>
          Default Toast
        </Button>
      </div>
    </div>
  );
};

export default function UIPlayground() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [switchEnabled, setSwitchEnabled] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background p-4 space-y-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">UI Component Playground</h1>
            <p className="text-muted">Explore and test all available UI components</p>
          </div>

          {/* Breadcrumb */}
          <Card className="p-4 mb-8">
            <Breadcrumb items={breadcrumbItems} />
          </Card>

          {/* Base Components */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Base Components</h2>

            {/* Buttons */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4 mb-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                <Button variant="primary" size="sm">
                  Small
                </Button>
                <Button variant="primary" size="md">
                  Medium
                </Button>
                <Button variant="primary" size="lg">
                  Large
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Form Inputs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  icon={<span>🔒</span>}
                />
                <div className="md:col-span-2">
                  <Textarea label="Message" placeholder="Enter your message here..." rows={3} />
                </div>
              </div>
            </div>
          </Card>

          {/* Form Components */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Form Components</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Select
                  label="Select Option"
                  options={selectOptions}
                  placeholder="Choose an option"
                  value={selectValue}
                  onValueChange={(value) => setSelectValue(value as string)}
                />
              </div>

              <div>
                <RadioGroup
                  name="example-radio"
                  options={radioOptions}
                  value={radioValue}
                  onValueChange={setRadioValue}
                />
              </div>

              <div>
                <Checkbox
                  label="Accept terms and conditions"
                  description="You must accept the terms to continue"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
              </div>

              <div>
                <Switch
                  label="Enable notifications"
                  description="Receive updates about your account"
                  checked={switchEnabled}
                  onChange={(e) => setSwitchEnabled(e.target.checked)}
                />
              </div>
            </div>
          </Card>

          {/* Data Display Components */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Data Display</h2>

            {/* Badges */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            {/* Avatars */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Avatars</h3>
              <div className="flex items-center gap-4">
                <Avatar size="xs" fallback="XS" />
                <Avatar size="sm" fallback="SM" />
                <Avatar size="md" fallback="MD" status="online" showStatus />
                <Avatar size="lg" fallback="LG" status="away" showStatus />
                <Avatar size="xl" fallback="XL" status="busy" showStatus />
                <Avatar size="2xl" fallback="2XL" />
              </div>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Progress & Spinners</h3>
              <div className="space-y-4">
                <Progress value={25} variant="primary" label="Upload Progress" showValue />
                <Progress value={50} variant="success" />
                <Progress value={75} variant="warning" />
                <div className="flex items-center gap-4">
                  <Spinner size="sm" variant="primary" />
                  <Spinner size="md" variant="secondary" />
                  <Spinner size="lg" variant="accent" />
                </div>
              </div>
            </div>

            {/* Sample Cards */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="default">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <p className="text-muted">This is a default card with some content.</p>
                  </CardBody>
                  <CardFooter>
                    <Button variant="outline" size="sm">
                      Action
                    </Button>
                  </CardFooter>
                </Card>

                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <p className="text-muted">This card has an elevated shadow effect.</p>
                  </CardBody>
                </Card>
              </div>
            </div>
          </Card>

          {/* Interactive Components */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Interactive Components</h2>

            <div className="space-y-8">
              {/* Modal */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Modal</h3>
                <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
                <Modal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  title="Example Modal"
                  description="This is an example modal dialog."
                >
                  <p className="text-muted mb-4">
                    This modal demonstrates the overlay functionality with proper focus management
                    and keyboard navigation.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                      Confirm
                    </Button>
                  </div>
                </Modal>
              </div>

              {/* Tooltip & Popover */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tooltip & Popover</h3>
                <div className="flex gap-4">
                  <Tooltip content="This is a helpful tooltip" position="top">
                    <Button variant="outline">Hover for tooltip</Button>
                  </Tooltip>

                  <Popover
                    trigger={<Button variant="outline">Click for popover</Button>}
                    content={
                      <div className="p-4 w-64">
                        <h4 className="font-semibold mb-2">Popover Content</h4>
                        <p className="text-sm text-muted">
                          This is a popover with more detailed information.
                        </p>
                      </div>
                    }
                    position="bottom"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Tabs</h3>
                <Tabs items={tabItems} defaultValue="tab1" />
              </div>

              {/* Toast Demo */}
              <ToastDemo />
            </div>
          </Card>

          {/* Navigation Components */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-6">Navigation Components</h2>

            {/* Accordion */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Accordion</h3>
              <Accordion items={accordionItems} type="single" collapsible />
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-muted py-8">
            <p>UI Component Library - Built with Next.js, TailwindCSS, and TypeScript</p>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
