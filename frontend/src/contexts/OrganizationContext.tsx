import { createContext, useContext, type ReactNode } from 'react';

// TODO: replace with real auth/session once login exists
const CURRENT_ORGANIZATION_ID = 'cmsdjv6tv0000p6p9d4ebok37';
const CURRENT_USER_ID = 'cmsdjv6ul0001p6p996rgsbjz';

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
