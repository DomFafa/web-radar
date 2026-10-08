import { describe, expect, it } from 'vitest';
import * as access from '../src/shared/access';

describe('website-building account access', () => {
  it('keeps website building for the designated account only', () => {
    expect(access.canBuildWebsites({ email: 'vc.ddom@gmail.com' })).toBe(true);
    expect(access.canBuildWebsites({ email: 'VC.DDOM@GMAIL.COM' })).toBe(true);
    for (const email of ['admin@example.com', 'vc.ddom+other@gmail.com', 'other@gmail.com', '']) {
      expect(access.canBuildWebsites({ email })).toBe(false);
    }
    expect(access.canBuildWebsites(null)).toBe(false);
    expect(access.canBuildWebsites(undefined)).toBe(false);
  });

  it('does not grant website building through another account administrator role', () => {
    const otherAdmin = {
      email: 'other-admin@example.com', systemRole: 'super_admin' as const,
      workspaceRole: 'admin' as const, appRole: 'admin' as const,
      userId: 'other', authSubject: 'other', displayName: 'Other',
      workspaceId: 'same-workspace', workspaceName: 'Company',
    };
    expect(access.manageUsers(otherAdmin)).toBe(true);
    expect(access.writeBusiness(otherAdmin)).toBe(true);
    expect(access.canBuildWebsites(otherAdmin)).toBe(false);
  });
});
