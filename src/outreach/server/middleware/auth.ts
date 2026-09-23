import { createMiddleware } from "hono/factory";
import type { Bindings, Variables, UserRole } from "../../shared/types";
import { RolePermissions } from "../../shared/types";
type Env = { Bindings: Bindings; Variables: Variables };
/**
 * 需要登录中间件
 */
export const requireAuth = createMiddleware<Env>(async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ success: false, error: "未登录，请先登录" }, 401);
  }
  await next();
});

/**
 * 角色权限中间件工厂
 * @param requiredPermission - 所需权限，如 "contacts:write"
 */
export function requirePermission(requiredPermission: string) {
  return createMiddleware<Env>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ success: false, error: "未登录" }, 401);
    }

    const permissions = RolePermissions[user.role as UserRole] || [];
    if (!permissions.includes(requiredPermission)) {
      return c.json(
        { success: false, error: "权限不足，无法执行此操作" },
        403
      );
    }

    await next();
  });
}

/**
 * 角色中间件工厂 — 要求特定角色
 * @param roles - 允许的角色列表
 */
export function requireRole(...roles: UserRole[]) {
  return createMiddleware<Env>(async (c, next) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ success: false, error: "未登录" }, 401);
    }

    if (!roles.includes(user.role as UserRole)) {
      return c.json(
        { success: false, error: "角色权限不足" },
        403
      );
    }

    await next();
  });
}
