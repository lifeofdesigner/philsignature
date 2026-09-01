# Modal Dialog (`<Dialog />`)

## Location
`src/components/ui/dialog.tsx`

## Architecture
Built on `@radix-ui/react-dialog`. Includes:
- `Dialog` (Root state manager)
- `DialogTrigger` (Button opening the modal)
- `DialogOverlay` (Backdrop blur)
- `DialogContent` (Centered luxury card container)
- `DialogHeader`, `DialogTitle`, `DialogDescription`
- `DialogClose` (Close button)

## Usage
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button variant="luxury">Open Salon</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Fragrance Consultation</DialogTitle>
    </DialogHeader>
    <p>Modal content goes here...</p>
  </DialogContent>
</Dialog>
```

