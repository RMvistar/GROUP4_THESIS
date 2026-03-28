export const requirePermission = (...perms) => {
  return (req, res, next) => {
    // Debug log for diagnosing permission issues
    console.log("[RBAC] req.user:", req.user);
    if (req.user && req.user.role) {
      console.log("[RBAC] req.user.role:", req.user.role);
      console.log("[RBAC] req.user.role.permissions:", req.user.role.permissions);
    }
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Admin bypass
    if (req.user.role?.name === "Admin") return next();

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


    // Admin bypass
    if (req.user.role?.name === "Admin") return next();
    // PowerUser bypass for alerts/tasks
    if (req.user.role?.name === "PowerUser") return next();
    // Worker bypass for acknowledge and resolve endpoints
    if (
      req.user.role?.name === "Worker" &&
      req.method === "PATCH" &&
      req.baseUrl.includes("tasks") &&
      (
        req.path.match(/\/[^/]+\/acknowledge$/) ||
        req.path.match(/\/[^/]+\/resolve$/)
      )
    ) {
      return next();
    }

    const userPerms = req.user.role?.permissions || [];
    const hasAny = perms.some((p) => userPerms.includes(p));

    if (!hasAny) return res.status(403).json({ message: "Forbidden" });

    next();
  };
};
