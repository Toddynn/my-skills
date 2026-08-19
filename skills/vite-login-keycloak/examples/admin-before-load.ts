import { redirect } from "@tanstack/react-router";

const ACCESS_ROLE = "acesso";

export async function adminBeforeLoad(
  context: {
    auth: {
      keycloak: {
        currentUser: { roles: string[] } | null;
        refresh: () => Promise<{ roles: string[] } | null>;
      };
    };
  },
  locationHref: string,
) {
  const user = context.auth.keycloak.currentUser ?? (await context.auth.keycloak.refresh());

  if (!user) {
    throw redirect({ to: "/login", search: { redirect: locationHref } });
  }

  if (!user.roles.includes(ACCESS_ROLE)) {
    throw redirect({
      to: "/login",
      search: { redirect: locationHref, unauthorized: true },
    });
  }
}
