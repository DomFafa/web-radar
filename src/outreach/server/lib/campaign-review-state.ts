// Only submission uncertainty is settled here. Delivery, opens and clicks remain asynchronous.
export async function settleReviewedCampaign(db: D1Database, id: string) {
  await db
    .prepare(
      `UPDATE edm_campaigns SET status=CASE WHEN total_sent>0 THEN 'completed' ELSE 'failed' END,
    completed_at=COALESCE(completed_at,?),updated_at=? WHERE id=? AND status='needs_review'
    AND NOT EXISTS(SELECT 1 FROM edm_campaign_recipients WHERE campaign_id=?
      AND (status IN ('pending','queued','sending') OR error_message LIKE '待核实%'))`,
    )
    .bind(Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), id, id)
    .run();
}
