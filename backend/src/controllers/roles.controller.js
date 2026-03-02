import Role from "../models/Role.js";

export async function getRoles(req, res) {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.status(200).json(roles);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

export async function createRole(req, res) {
  try {
    const { name, permissions = [] } = req.body;
    if (!name)
      return res.status(400).json({ message: "Role name is required" });

    const role = await Role.create({ name, permissions });
    res.status(201).json({ message: "Role created", role });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Role name already exists" });
    }
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
export async function updateRole(req, res) {
  try {
    const { name, permissions } = req.body;

    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(permissions && { permissions }) },
      { new: true, runValidators: true },
    );

    if (!role) return res.status(404).json({ message: "Role not found" });
    res.status(200).json({ message: "Role updated", role });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

export async function deleteRole(req, res) {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    if (role.isSystem)
      return res.status(400).json({ message: "Cannot delete a system role" });

    await role.deleteOne();
    res.status(200).json({ message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}
