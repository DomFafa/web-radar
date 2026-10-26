import { z } from 'zod';

export const replyAddressSchema = z.union([
  z.string().trim().max(254).refine((value) => !value || z.email().safeParse(value).success),
  z.null(),
  z.undefined(),
]);

/** Empty uses the workspace's verified receiving mailbox, then the sender. */
export async function directReplyAddress(
  db: D1Database,
  workspaceId: string,
  requested: string | null | undefined,
  sender: string,
) {
  const custom = replyAddressSchema.parse(requested);
  if (custom) return custom;
  const config = await db.prepare(
    'SELECT forward_to FROM wr_inbox_configs WHERE workspace_id=? AND enabled=1 AND verified_at IS NOT NULL LIMIT 1',
  ).bind(workspaceId).first<{ forward_to: string }>();
  return config?.forward_to || sender;
}
