# Permission Engine Flow & Decoupled Authorization

## Principle: Never Check Roles Directly in UI
To prevent role fragmentation and hardcoded conditions like `role === 'admin'` scattering throughout UI components, PHILZ SIGNATURE enforces capability-driven checks via `PermissionEngine` (`src/lib/permissionEngine.ts`).

---

## Permission Matrix

| Capability Function | Required Role / Rule | UI Application |
| :--- | :--- | :--- |
| `canAccessAdmin(user)` | `staff` or `super_admin` | Protects `/admin/*` shell |
| `canAccessCustomer(user)` | Authenticated (`user != null`) | Protects `/account/*` shell |
| `canManageProducts(user)` | `staff` or `super_admin` | Product editor & inventory controls |
| `canDeleteProduct(user)` | `super_admin` only | Delete buttons in catalog table |
| `canManageOrders(user)` | `staff` or `super_admin` | Order status changes & tracking updates |
| `canDeleteOrder(user)` | `super_admin` only | Permanent order cancellation/purge |
| `canManageCMS(user)` | `staff` or `super_admin` | Homepage billboard & story editing |
| `canManageUsers(user)` | `super_admin` only | Role elevation & user deactivation |
| `canEditSettings(user)` | `super_admin` only | Store settings & payment gateways |
| `canDeleteMedia(user)` | `super_admin` only | Permanent deletion of storage assets |
| `canViewAnalytics(user)` | `staff` or `super_admin` | Revenue & sales reports |
| `canModerateReviews(user)` | `staff` or `super_admin` | Testimonial approvals |

---

## Component Usage Pattern

```tsx
import { useAuth } from '@/hooks/useAuth';

export const ProductRowActions = ({ product }) => {
  const { canManageProducts, canDeleteMedia } = useAuth();

  return (
    <div>
      {canManageProducts && <button>Edit Flacon</button>}
      {canDeleteMedia && <button className="text-red-500">Purge</button>}
    </div>
  );
};
```

