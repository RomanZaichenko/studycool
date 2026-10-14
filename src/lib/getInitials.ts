export function getInitials(
  user?: { name?: string | null; email?: string | null } | null
) {
  if (user?.name) return user.name.split(" ").map((n) => n[0]).join("").toUpperCase();
  if (user?.email) return user.email[0].toUpperCase();
  return "U";
}