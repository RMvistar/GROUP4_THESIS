export function getRoleName(user) {
  if (typeof user?.role === "string") {
    return user.role;
  }

  return user?.role?.name || "User";
}

export function getFullName(user) {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || "User";
}

export function getUserIdLabel(user) {
  return user?.government_id || "";
}

export function getUsernameLabel(user) {
  return user?.name || user?.username || "";
}

export function getProfileInitials(user) {
  const initials = [user?.first_name?.[0], user?.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (initials) {
    return initials;
  }

  return user?.name?.[0]?.toUpperCase() || "U";
}
