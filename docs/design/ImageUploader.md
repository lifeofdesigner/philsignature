# Image Uploader Component (`<ImageUploader />`)

## Architecture
- Drag-and-drop zone using HTML5 Drag/Drop API.
- Instant client-side image preview via `URL.createObjectURL()`.
- MIME type and file size validation (e.g. max 15MB).
- Direct upload to Supabase Storage via `MediaRepository`.
- Progress indicator and copyable CDN URL generation.
- Zero raw JSON or raw storage payload exposed to the user.

