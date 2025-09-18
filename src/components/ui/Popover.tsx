import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  triggerMode?: 'click' | 'hover';
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  offset?: number;
  className?: string;
  disabled?: boolean;
}

const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  position = 'bottom',
  align = 'center',
  triggerMode = 'click',
  closeOnClickOutside = true,
  closeOnEscape = true,
  offset = 8,
  className,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const openPopover = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const closePopover = () => {
    setIsOpen(false);
  };

  const togglePopover = () => {
    if (isOpen) {
      closePopover();
    } else {
      openPopover();
    }
  };

  // Calculate optimal position based on viewport
  useEffect(() => {
    if (isOpen && triggerRef.current && contentRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let newPosition = position;

      // Check if popover would overflow and adjust position
      switch (position) {
        case 'top':
          if (triggerRect.top - contentRect.height - offset < 0) {
            newPosition = 'bottom';
          }
          break;
        case 'bottom':
          if (triggerRect.bottom + contentRect.height + offset > viewport.height) {
            newPosition = 'top';
          }
          break;
        case 'left':
          if (triggerRect.left - contentRect.width - offset < 0) {
            newPosition = 'right';
          }
          break;
        case 'right':
          if (triggerRect.right + contentRect.width + offset > viewport.width) {
            newPosition = 'left';
          }
          break;
      }

      setActualPosition(newPosition);
    }
  }, [isOpen, position, offset]);

  // Handle click outside
  useEffect(() => {
    if (isOpen && closeOnClickOutside) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          contentRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !contentRef.current.contains(event.target as Node)
        ) {
          closePopover();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, closeOnClickOutside]);

  // Handle escape key
  useEffect(() => {
    if (isOpen && closeOnEscape) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closePopover();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, closeOnEscape]);

  const getPositionClasses = () => {
    const baseOffset = `${offset}px`;
    
    switch (actualPosition) {
      case 'top':
        return {
          content: `bottom-full mb-[${baseOffset}]`,
          align: align === 'start' ? 'left-0' : 
                align === 'end' ? 'right-0' : 
                'left-1/2 -translate-x-1/2'
        };
      case 'bottom':
        return {
          content: `top-full mt-[${baseOffset}]`,
          align: align === 'start' ? 'left-0' : 
                align === 'end' ? 'right-0' : 
                'left-1/2 -translate-x-1/2'
        };
      case 'left':
        return {
          content: `right-full mr-[${baseOffset}]`,
          align: align === 'start' ? 'top-0' : 
                align === 'end' ? 'bottom-0' : 
                'top-1/2 -translate-y-1/2'
        };
      case 'right':
        return {
          content: `left-full ml-[${baseOffset}]`,
          align: align === 'start' ? 'top-0' : 
                align === 'end' ? 'bottom-0' : 
                'top-1/2 -translate-y-1/2'
        };
      default:
        return { content: '', align: '' };
    }
  };

  const positionClasses = getPositionClasses();

  const triggerProps = triggerMode === 'hover'
    ? {
        onMouseEnter: openPopover,
        onMouseLeave: closePopover
      }
    : {
        onClick: togglePopover
      };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        {...triggerProps}
        className={triggerMode === 'click' ? 'cursor-pointer' : undefined}
      >
        {trigger}
      </div>

      {isOpen && !disabled && (
        <div
          ref={contentRef}
          className={cn(
            'absolute z-50 bg-surface border border-stone-200 rounded-md shadow-medium',
            positionClasses.content,
            positionClasses.align,
            className
          )}
          style={{ 
            marginTop: actualPosition === 'bottom' ? offset : undefined,
            marginBottom: actualPosition === 'top' ? offset : undefined,
            marginLeft: actualPosition === 'right' ? offset : undefined,
            marginRight: actualPosition === 'left' ? offset : undefined,
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Popover;