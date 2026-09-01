# Component Architecture & Guidelines

## Core Principles
1. **Headless Radix Foundation**: All interactive primitives use Radix UI for 100% accessible keyboard navigation and focus management.
2. **CVA Variant System**: `class-variance-authority` controls visual variants (`luxury`, `dark`, `outline`, `goldOutline`, `ghost`).
3. **No Inline Heavy CSS**: Clean utility classes using the `cn()` merge helper.
4. **Framer Motion Micro-Interactions**: Soft hover states, 0.99 active press scaling, and 300ms cubic-bezier transitions.

