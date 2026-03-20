export const requirePermission = (...perms) => {
  return (req, res, next) => {
    // Debug log for diagnosing permission issues
    console.log("[RBAC] req.user:", req.user);
    if (req.user && req.user.role) {
      console.log("[RBAC] req.user.role:", req.user.role);
      console.log("[RBAC] req.user.role.permissions:", req.user.role.permissions);
    }
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Super Admin
    if (req.user.role?.name === "Super Admin") return next();

    const userPerms = req.user.role?.permissions || [];
    const hasAll = perms.every((p) => userPerms.includes(p));

    if (!hasAll) return res.status(403).json({ message: "Forbidden" });

    next();
  };
};

// User must have AT LEAST ONE of the listed permission
export const requireAnyPermission = (...perms) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Super Admin bypass
    if (req.user.role?.name === "Super Admin") return next();
    // Admin bypass for alerts/tasks
    if (req.user.role?.name === "Admin") return next();

    const userPerms = req.user.role?.permissions || [];
    const hasAny = perms.some((p) => userPerms.includes(p));

    if (!hasAny) return res.status(403).json({ message: "Forbidden" });

    next();
  };
};
