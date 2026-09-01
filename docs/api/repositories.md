# Repository Pattern Specifications

## Repositories Responsibility
Only repositories interact directly with the Supabase client. They encapsulate SQL queries, filters, joins, error mapping, and pagination.

## Core Repositories:
- `ProductRepository`:
  - `findAll(filter)`
  - `findBySlug(slug)`
  - `findById(id)`
  - `create(data)`
  - `update(id, data)`
  - `delete(id)`
- `OrderRepository`:
  - `create(orderData, items)`
  - `findById(id)`
  - `findByOrderNumber(number, email)`
  - `findByCustomerId(customerId)`
  - `updateStatus(id, status)`
- `CategoryRepository`:
  - `findAll()`
  - `create(data)`
- `CMSRepository`:
  - `getSection(key)`
  - `upsertSection(key, content)`
- `UserRepository`:
  - `getProfile(userId)`
  - `updateProfile(userId, data)`

