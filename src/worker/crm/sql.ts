import type { Principal } from '../../shared/model';
import { manageUsers, viewTeamData } from '../../shared/access';

// Site identity is the exact submitted URL. Only an explicit, audited link joins it to a contact.
export function communicationQuery(p: Principal) {
  const body = manageUsers(p) ? '1' : '(b.created_by=? OR t.assignee_id=? OR cfg.team_body=1)';
  const visible = viewTeamData(p) ? '' : ' AND (b.created_by=? OR t.assignee_id=?)';
  const source = (channel: 'edm' | 'site') => {
    const edm = channel === 'edm';
    const uncertain = edm ? "(COALESCE(s.status,'')='uncertain' OR COALESCE(r.error_message,'') LIKE '待核实%')" : "(COALESCE(s.status,'') IN ('uncertain','submitted_unconfirmed') OR COALESCE(r.result_code,'') IN ('submission_uncertain','submitted_unconfirmed'))";
    return `SELECT '${channel}' source, r.id target_id,b.id business_id,b.name business_name,
      b.user_id workspace_id,b.created_by owner_id,m.display_name owner_name,
      ${edm ? "'contact:'||c.id" : "CASE WHEN c.id IS NOT NULL THEN 'contact:'||c.id ELSE 'site:'||r.website_url END"} customer_key,
      c.id contact_id,${edm ? "CASE WHEN s.id IS NOT NULL OR ir.id IS NOT NULL OR r.sent_at IS NOT NULL OR r.status IN ('sent','delivered','opened','clicked','replied') THEN COALESCE(s.recipient_email,ir.original_email) ELSE c.email END" : 'c.email'} email,c.group_id,g.name group_name,
      ${edm ? 'c.website' : 'r.website_url'} website,COALESCE(c.name,c.company,${edm ? 's.recipient_email,c.email' : 'r.website_url'}) customer_label,
      c.company,CASE WHEN ${uncertain} THEN 'uncertain' ELSE r.status END status,
      ${edm ? "CASE WHEN r.sent_at IS NOT NULL OR r.status IN ('sent','delivered','opened','clicked','replied') THEN 1 ELSE 0 END" : `CASE WHEN r.status='submitted' AND NOT ${uncertain} THEN 1 ELSE 0 END`} sent,
      CASE WHEN EXISTS(SELECT 1 FROM wr_inbox_messages rm WHERE rm.thread_id=t.id AND rm.kind='human') THEN 1 ELSE 0 END replied,
      CASE WHEN r.status='failed' AND NOT ${uncertain} THEN 1 ELSE 0 END failed,
      CASE WHEN ${uncertain} THEN 1 ELSE 0 END uncertain,
      CASE WHEN ir.id IS NOT NULL ${edm ? "AND b.mailchimp_campaign_id IS NULL AND COALESCE(s.provider,'')!='mailchimp_marketing'" : ''} THEN 1 ELSE 0 END tracked,
      strftime('%Y-%m-%dT%H:%M:%SZ',r.created_at,'unixepoch') created_at,
      strftime('%Y-%m-%dT%H:%M:%SZ',${edm ? 'r.sent_at' : 'r.completed_at'},'unixepoch') sent_at,
      MAX(COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',t.last_received_at),''),COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',s.completed_at),''),COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',s.created_at),''),COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',${edm ? 'COALESCE(r.sent_at,r.created_at)' : 'COALESCE(r.completed_at,r.created_at)'},'unixepoch'),'')) last_activity_at,
      COALESCE(s.subject,ir.subject) subject,COALESCE(s.body_text,ir.snapshot) body_text,s.body_html,
      CASE WHEN s.id IS NOT NULL THEN 'captured' WHEN ir.snapshot IS NOT NULL THEN 'legacy_partial' ELSE 'unavailable' END capture_status,
      s.provider,COALESCE(s.provider_message_id,ir.provider_message_id,${edm ? 'r.ses_message_id' : 'NULL'}) provider_message_id,
      COALESCE(s.error_message,${edm ? 'r.error_message' : 'r.result_message'}) error_message,
      t.id thread_id,t.assignee_id,${body} can_body,s.sender_email,s.sender_name,s.reply_to
      FROM ${edm ? 'edm_campaign_recipients r JOIN edm_campaigns b ON b.id=r.campaign_id JOIN edm_contacts c ON c.id=r.contact_id AND c.user_id=b.user_id' : 'edm_site_message_targets r JOIN edm_site_message_jobs b ON b.id=r.job_id LEFT JOIN wr_crm_customer_links l ON l.workspace_id=b.user_id AND l.site_url=r.website_url LEFT JOIN edm_contacts c ON c.id=l.contact_id AND c.user_id=b.user_id'}
      LEFT JOIN edm_contact_groups g ON g.id=c.group_id AND g.user_id=b.user_id
      LEFT JOIN wr_members m ON m.workspace_id=b.user_id AND m.user_id=b.created_by
      LEFT JOIN wr_inbox_routes ir ON ir.workspace_id=b.user_id AND ir.source='${channel}' AND ir.target_id=r.id
      LEFT JOIN wr_inbox_threads t ON t.route_id=ir.id AND t.workspace_id=b.user_id
      LEFT JOIN wr_inbox_configs cfg ON cfg.id=t.config_id AND cfg.workspace_id=b.user_id
      LEFT JOIN wr_crm_outbound_snapshots s ON s.id=(SELECT cs.id FROM wr_crm_outbound_snapshots cs WHERE cs.workspace_id=b.user_id AND cs.source='${channel}' AND cs.target_id=r.id ORDER BY cs.created_at DESC,cs.id DESC LIMIT 1)
      WHERE b.user_id=?${visible}`;
  };
  const args: unknown[] = [];
  for (let i = 0; i < 2; i++) {
    if (!manageUsers(p)) args.push(p.userId, p.userId);
    args.push(p.workspaceId);
    if (!viewTeamData(p)) args.push(p.userId, p.userId);
  }
  const orphanBody = manageUsers(p) ? '1' : '(s.owner_id=? OR t.assignee_id=? OR cfg.team_body=1)';
  const orphanVisible = viewTeamData(p) ? '' : 'AND (s.owner_id=? OR t.assignee_id=?)';
  const orphan = `SELECT s.source,s.target_id,s.business_id,'历史任务（原任务或客户已删除）' business_name,
    s.workspace_id,s.owner_id,m.display_name owner_name,
    CASE WHEN COALESCE(s.contact_id,c.id) IS NOT NULL THEN 'contact:'||COALESCE(s.contact_id,c.id) WHEN s.website_url IS NOT NULL THEN 'site:'||s.website_url ELSE 'history:'||s.source||':'||s.target_id END customer_key,
    COALESCE(s.contact_id,c.id) contact_id,CASE WHEN s.source='edm' THEN s.recipient_email ELSE c.email END email,c.group_id,g.name group_name,
    s.website_url website,COALESCE(s.recipient_email,s.website_url,'历史客户（收件资料未保存）') customer_label,c.company,CASE WHEN s.status='submitted_unconfirmed' THEN 'uncertain' ELSE s.status END status,
    CASE WHEN EXISTS(SELECT 1 FROM wr_crm_outbound_snapshots sent WHERE sent.workspace_id=s.workspace_id AND sent.source=s.source AND sent.target_id=s.target_id AND sent.status IN ('sent','submitted')) THEN 1 ELSE 0 END sent,
    CASE WHEN EXISTS(SELECT 1 FROM wr_inbox_messages rm WHERE rm.thread_id=t.id AND rm.kind='human') THEN 1 ELSE 0 END replied,
    CASE WHEN s.status='failed' THEN 1 ELSE 0 END failed,
    CASE WHEN s.status IN ('uncertain','submitted_unconfirmed') THEN 1 ELSE 0 END uncertain,
    CASE WHEN ir.id IS NOT NULL AND COALESCE(s.provider,'')!='mailchimp_marketing' THEN 1 ELSE 0 END tracked,
    s.created_at,CASE WHEN s.status IN ('sent','submitted') THEN s.completed_at ELSE NULL END sent_at,
    MAX(COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',t.last_received_at),''),COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',s.completed_at),''),COALESCE(strftime('%Y-%m-%dT%H:%M:%SZ',s.created_at),'')) last_activity_at,
    s.subject,s.body_text,s.body_html,'captured' capture_status,s.provider,s.provider_message_id,s.error_message,t.id thread_id,t.assignee_id,${orphanBody} can_body,s.sender_email,s.sender_name,s.reply_to
    FROM wr_crm_outbound_snapshots s
    LEFT JOIN wr_crm_customer_links l ON l.workspace_id=s.workspace_id AND l.site_url=s.website_url
    LEFT JOIN edm_contacts c ON c.user_id=s.workspace_id AND c.id=COALESCE(s.contact_id,l.contact_id)
    LEFT JOIN edm_contact_groups g ON g.id=c.group_id AND g.user_id=s.workspace_id
    LEFT JOIN wr_members m ON m.workspace_id=s.workspace_id AND m.user_id=s.owner_id
    LEFT JOIN wr_inbox_routes ir ON ir.workspace_id=s.workspace_id AND ir.source=s.source AND ir.target_id=s.target_id
    LEFT JOIN wr_inbox_threads t ON t.route_id=ir.id AND t.workspace_id=s.workspace_id
    LEFT JOIN wr_inbox_configs cfg ON cfg.id=t.config_id AND cfg.workspace_id=s.workspace_id
    WHERE s.workspace_id=? ${orphanVisible}
    AND s.id=(SELECT latest.id FROM wr_crm_outbound_snapshots latest WHERE latest.workspace_id=s.workspace_id AND latest.source=s.source AND latest.target_id=s.target_id ORDER BY latest.created_at DESC,latest.id DESC LIMIT 1)
    AND NOT EXISTS(SELECT 1 FROM edm_campaign_recipients r JOIN edm_campaigns b ON b.id=r.campaign_id JOIN edm_contacts c ON c.id=r.contact_id AND c.user_id=b.user_id WHERE s.source='edm' AND b.user_id=s.workspace_id AND r.id=s.target_id)
    AND NOT EXISTS(SELECT 1 FROM edm_site_message_targets r JOIN edm_site_message_jobs b ON b.id=r.job_id WHERE s.source='site' AND b.user_id=s.workspace_id AND r.id=s.target_id)`;
  if (!manageUsers(p)) args.push(p.userId, p.userId);
  args.push(p.workspaceId);
  if (!viewTeamData(p)) args.push(p.userId, p.userId);
  return { sql: `WITH communication AS (${source('edm')} UNION ALL ${source('site')} UNION ALL ${orphan})`, args };
}

export function customerQuery(p: Principal, filter = { sql: '1=1', args: [] as unknown[] }) {
  const q = communicationQuery(p);
  return {
    sql: `${q.sql}, filtered_communication AS (SELECT * FROM communication q WHERE ${filter.sql}), customers AS (
      SELECT 'contact:'||c.id customer_key,COALESCE(c.name,c.company,c.email) label,c.id contact_id,
        c.email,c.website,c.company,c.group_id,g.name group_name
      FROM edm_contacts c LEFT JOIN edm_contact_groups g ON g.id=c.group_id AND g.user_id=c.user_id WHERE c.user_id=?
      UNION ALL
      SELECT q.customer_key,CASE WHEN q.contact_id IS NOT NULL THEN '历史联系人 · '||COALESCE(MAX(q.email),q.contact_id) ELSE COALESCE(MAX(q.website),'历史客户（收件资料未保存）') END label,
        NULL contact_id,MAX(q.email) email,MAX(q.website) website,MAX(q.company) company,MAX(q.group_id) group_id,MAX(q.group_name) group_name
      FROM filtered_communication q WHERE q.contact_id IS NULL OR NOT EXISTS(SELECT 1 FROM edm_contacts c WHERE c.user_id=q.workspace_id AND c.id=q.contact_id) GROUP BY q.customer_key
    ), customer_stats AS (
      SELECT customer_key,SUM(sent) sent,SUM(replied) replied,SUM(failed) failed,SUM(uncertain) uncertain,MAX(last_activity_at) last_activity_at
      FROM filtered_communication GROUP BY customer_key
    )`,
    args: [...q.args, ...filter.args, p.workspaceId],
  };
}
