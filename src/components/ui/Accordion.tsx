import React, { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { HiOutlineChevronDown } from 'react-icons/hi2';

export interface AccordionItem {
  id: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items?: AccordionItem[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface AccordionContextType {
  type: 'single' | 'multiple';
  value: string | string[];
  onItemToggle: (itemId: string) => void;
  collapsible: boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(undefined);

const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('Accordion components must be used within an Accordion');
  }
  return context;
};

const Accordion: React.FC<AccordionProps> = ({
  items,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
  children,
}) => {
  const [internalValue, setInternalValue] = useState<string | string[]>(() => {
    if (value !== undefined) return value;
    if (defaultValue !== undefined) return defaultValue;
    return type === 'multiple' ? [] : '';
  });

  const currentValue = value !== undefined ? value : internalValue;

  const handleItemToggle = (itemId: string) => {
    let newValue: string | string[];

    if (type === 'multiple') {
      const arrayValue = Array.isArray(currentValue) ? currentValue : [];
      if (arrayValue.includes(itemId)) {
        newValue = arrayValue.filter((id) => id !== itemId);
      } else {
        newValue = [...arrayValue, itemId];
      }
    } else {
      // Single mode
      if (currentValue === itemId && collapsible) {
        newValue = '';
      } else {
        newValue = itemId;
      }
    }

    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const contextValue = {
    type,
    value: currentValue,
    onItemToggle: handleItemToggle,
    collapsible,
  };

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        {items
          ? items.map((item) => (
              <AccordionItem key={item.id} value={item.id} disabled={item.disabled}>
                <AccordionTrigger>{item.trigger}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))
          : children}
      </div>
    </AccordionContext.Provider>
  );
};

interface AccordionItemProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  disabled = false,
  className,
  children,
}) => {
  const { value: accordionValue, type } = useAccordion();

  const isOpen =
    type === 'multiple'
      ? Array.isArray(accordionValue) && accordionValue.includes(value)
      : accordionValue === value;

  return (
    <div
      className={cn(
        'border-b border-stone-200 last:border-b-0',
        disabled && 'opacity-50',
        className,
      )}
      data-state={isOpen ? 'open' : 'closed'}
      data-disabled={disabled}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const additionalProps = {
            value,
            disabled,
            isOpen,
          };
          return React.cloneElement(child, additionalProps as Record<string, unknown>);
        }
        return child;
      })}
    </div>
  );
};

interface AccordionTriggerProps {
  value?: string;
  disabled?: boolean;
  isOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  value,
  disabled = false,
  isOpen = false,
  className,
  children,
}) => {
  const { onItemToggle } = useAccordion();

  const handleClick = () => {
    if (!disabled && value) {
      onItemToggle(value);
    }
  };

  return (
    <button
      className={cn(
        'flex w-full items-center justify-between py-4 px-0 text-left font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        disabled && 'cursor-not-allowed hover:no-underline',
        className,
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-expanded={isOpen}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <span className="text-foreground">{children}</span>
      <HiOutlineChevronDown
        className={cn(
          'h-4 w-4 shrink-0 text-muted transition-transform duration-200',
          isOpen && 'rotate-180',
        )}
        aria-hidden="true"
      />
    </button>
  );
};

interface AccordionContentProps {
  value?: string;
  isOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}

const AccordionContent: React.FC<AccordionContentProps> = ({
  isOpen = false,
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200 ease-in-out',
        isOpen ? 'pb-4' : 'max-h-0',
      )}
      data-state={isOpen ? 'open' : 'closed'}
    >
      <div className={cn('text-sm text-muted', className)}>{children}</div>
    </div>
  );
};

// Alternative name for Accordion
const Collapse = Accordion;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, Collapse };
export default Accordion;
