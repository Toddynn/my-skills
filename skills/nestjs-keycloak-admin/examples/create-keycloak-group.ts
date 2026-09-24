const desiredRoles = roles.includes(ADMIN_ROLES.ACCESS) ? roles : [...roles, ADMIN_ROLES.ACCESS];

const group = await this.keycloakAdminService.createRealmGroup(name.trim());

await this.keycloakAdminService.assignClientRolesToGroup(group.id, desiredRoles);

const groupRoles = await this.keycloakAdminService.getGroupClientRoles(group.id);

return {
	...group,
	roles: groupRoles
		.filter((role) => ASSIGNABLE_ROLE_VALUES.includes(role as (typeof ASSIGNABLE_ROLE_VALUES)[number]) || role === ADMIN_ROLES.ACCESS)
		.sort((a, b) => a.localeCompare(b, 'pt-BR')),
};
