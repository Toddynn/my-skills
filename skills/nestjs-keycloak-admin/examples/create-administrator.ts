const ACCESS_ROLE = "acesso";

export function rolesForNewAdministrator(roles: string[]): string[] {
  return roles.includes(ACCESS_ROLE) ? roles : [...roles, ACCESS_ROLE];
}
