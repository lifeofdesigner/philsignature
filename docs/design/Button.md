# Button Component (`<Button />`)

## Location
`src/components/ui/button.tsx`

## Variants
- `luxury`: Champagne Gold solid background with Obsidian Black text.
- `dark`: Charcoal background with subtle hairline border.
- `outline`: Transparent with hairline border, gold on hover.
- `goldOutline`: Transparent with gold border, fills gold on hover.
- `ghost`: Subtle hover background.
- `destructive`: Deep crimson background for deletion.

## Sizes
- `sm`: Height 36px (9), text 11px.
- `default`: Height 44px (11), text 12px.
- `lg`: Height 52px (13), text 14px.
- `icon`: Square 40px (10).

## Usage
```tsx
import { Button } from '@/components/ui/button';

<Button variant="luxury" size="lg">
  Acquire Flacon
</Button>
```

