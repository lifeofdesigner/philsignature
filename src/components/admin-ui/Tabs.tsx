import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const AdminTabs = TabsPrimitive.Root;

export const AdminTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-11 items-center justify-start border-b border-[#D1D5DB] bg-transparent p-0 text-[#374151]',
      className
    )}
    {...props}
  />
));
AdminTabsList.displayName = TabsPrimitive.List.displayName;

export const AdminTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 text-xs font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-2 data-[state=active]:border-[#111111] data-[state=active]:text-[#111111] data-[state=active]:font-semibold',
      className
    )}
    {...props}
  />
));
AdminTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const AdminTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('mt-4 focus-visible:outline-none', className)}
    {...props}
  />
));
AdminTabsContent.displayName = TabsPrimitive.Content.displayName;
