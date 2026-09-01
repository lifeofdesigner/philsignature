# Storage Buckets & Media Policies

## Buckets Architecture
| Bucket | Access | Allowed MIME Types | Max Size | Cache-Control |
| :--- | :--- | :--- | :--- | :--- |
| `products` | Public Read, Admin Write | `image/jpeg, image/png, image/webp, video/mp4` | 15 MB | `max-age=31536000` (1 Year) |
| `banners` | Public Read, Admin Write | `image/jpeg, image/png, image/webp` | 20 MB | `max-age=604800` (7 Days) |
| `branding` | Public Read, Admin Write | `image/svg+xml, image/png, image/x-icon` | 5 MB | `max-age=31536000` (1 Year) |
| `invoices` | Authenticated Read, System Write | `application/pdf` | 10 MB | `private, no-cache` |

## Image Optimization Policy
- High-resolution photographs must be compressed to WebP/JPEG before upload.
- Hero images: Max width 2560px.
- Product flacon images: Max width 1600px with square 1:1 or 4:5 aspect ratios.

