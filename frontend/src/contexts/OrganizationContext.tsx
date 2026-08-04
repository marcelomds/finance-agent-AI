import { createContext, useContext, type ReactNode } from 'react';

// TODO: replace with real auth/session once login exists.
// These match the fixed dev IDs in backend/prisma/seed.ts — stable across `db:fresh`.
const CURRENT_ORGANIZATION_ID = 'org_dev_acme';
const CURRENT_USER_ID = 'user_dev_test';

type OrganizationContextValue = {
  organizationId: string;
  userId: string;
};

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const value: OrganizationContextValue = {
    organizationId: CURRENT_ORGANIZATION_ID,
    userId: CURRENT_USER_ID,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}

export function useOrganization() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) throw new Error('useOrganization must be used within OrganizationProvider');
  return ctx;
}
