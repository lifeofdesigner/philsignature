import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Permission } from '@/lib/permissions';

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  permission?: Permission;
  badgeKey?: string;
  featureFlag?: string;
  category?: 'Commerce' | 'Content & Marketing' | 'Operations & Finance' | 'System & Security';
}

export interface DashboardWidget {
  id: string;
  title: string;
  component: ComponentType;
  permission?: Permission;
  defaultGridWidth?: 'full' | 'half' | 'third';
}

export interface AdminModule {
  id: string;
  name: string;
  description: string;
  navItems: NavItem[];
  dashboardWidgets?: DashboardWidget[];
  featureFlag?: string;
}

class ModuleRegistryClass {
  private modules: Map<string, AdminModule> = new Map();

  register(module: AdminModule) {
    this.modules.set(module.id, module);
  }

  getModule(id: string): AdminModule | undefined {
    return this.modules.get(id);
  }

  getAllModules(): AdminModule[] {
    return Array.from(this.modules.values());
  }

  getAllNavItems(): NavItem[] {
    const items: NavItem[] = [];
    for (const mod of this.modules.values()) {
      items.push(...mod.navItems);
    }
    return items;
  }

  getAllDashboardWidgets(): DashboardWidget[] {
    const widgets: DashboardWidget[] = [];
    for (const mod of this.modules.values()) {
      if (mod.dashboardWidgets) {
        widgets.push(...mod.dashboardWidgets);
      }
    }
    return widgets;
  }
}

export const ModuleRegistry = new ModuleRegistryClass();

