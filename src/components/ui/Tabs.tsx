import React, { useState, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface TabsContextType {
  activeTab: string;
  setActiveTab: (id: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
  size: 'sm' | 'md' | 'lg';
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider');
  }
  return context;
};

const Tabs: React.FC<TabsProps> = ({
  items,
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  size = 'md',
  className
}) => {
  const [activeTab, setActiveTab] = useState(
    value || defaultValue || items[0]?.id || ''
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleTabChange = (id: string) => {
    setActiveTab(id);
    onValueChange?.(id);
  };

  const contextValue = {
    activeTab,
    setActiveTab: handleTabChange,
    orientation,
    variant,
    size
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={cn(
          'w-full',
          orientation === 'vertical' && 'flex gap-4',
          className
        )}
      >
        <TabsList items={items} />
        <TabsContent items={items} />
      </div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ items: TabItem[] }> = ({ items }) => {
  const { activeTab, setActiveTab, orientation, variant, size } = useTabs();

  const containerStyles = cn(
    'flex',
    orientation === 'horizontal' ? 'border-b border-stone-200' : 'flex-col border-r border-stone-200 min-w-[200px]',
    variant === 'pills' && 'bg-stone-100 p-1 rounded-md border-0',
    variant === 'underline' && 'border-b-2 border-stone-200'
  );

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const getTabStyles = (item: TabItem) => {
    const baseStyles = cn(
      'flex items-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      sizes[size]
    );

    if (variant === 'pills') {
      return cn(
        baseStyles,
        'rounded-md',
        activeTab === item.id
          ? 'bg-surface text-foreground shadow-sm'
          : 'text-muted hover:text-foreground hover:bg-stone-200'
      );
    }

    if (variant === 'underline') {
      return cn(
        baseStyles,
        'border-b-2 -mb-0.5',
        activeTab === item.id
          ? 'border-primary text-primary'
          : 'border-transparent text-muted hover:text-foreground hover:border-stone-300'
      );
    }

    // Default variant
    return cn(
      baseStyles,
      'border-b-2 -mb-px',
      activeTab === item.id
        ? 'border-primary text-primary bg-surface'
        : 'border-transparent text-muted hover:text-foreground hover:border-stone-300'
    );
  };

  return (
    <div className={containerStyles} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          className={getTabStyles(item)}
          onClick={() => !item.disabled && setActiveTab(item.id)}
          disabled={item.disabled}
          role="tab"
          aria-selected={activeTab === item.id}
          aria-controls={`tabpanel-${item.id}`}
          id={`tab-${item.id}`}
        >
          {item.icon && (
            <span className="flex-shrink-0">
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  );
};

const TabsContent: React.FC<{ items: TabItem[] }> = ({ items }) => {
  const { activeTab, orientation } = useTabs();

  return (
    <div className={cn(
      'flex-1',
      orientation === 'vertical' ? 'pl-4' : 'pt-4'
    )}>
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            activeTab === item.id ? 'block' : 'hidden'
          )}
          role="tabpanel"
          id={`tabpanel-${item.id}`}
          aria-labelledby={`tab-${item.id}`}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
};

// Individual components for more flexible usage
const TabList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <div
      className={cn('flex border-b border-stone-200', className)}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

const Tab: React.FC<{
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}> = ({ children, disabled, className }) => {
  return (
    <button
      className={cn(
        'px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'border-transparent text-muted hover:text-foreground hover:border-stone-300',
        'data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-surface',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      role="tab"
      data-state="inactive" // This would be managed by parent component
    >
      {children}
    </button>
  );
};

const TabContent: React.FC<{
  value: string;
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn('pt-4', className)}
      role="tabpanel"
    >
      {children}
    </div>
  );
};

export { Tabs, TabList, Tab, TabContent };
export default Tabs;