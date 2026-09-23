-- Imported EDM feature tables; user_id references a Web Radar workspace actor.
--> statement-breakpoint
CREATE TABLE `edm_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'member' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `edm_users_email_unique` ON `edm_users` (`email`);
--> statement-breakpoint
CREATE TABLE `edm_contact_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`color` text DEFAULT '#6366f1',
	`contact_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `edm_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `edm_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`group_id` text,
	`email` text NOT NULL,
	`name` text,
	`company` text,
	`website` text,
	`industry` text,
	`region` text,
	`title` text,
	`phone` text,
	`tags` text,
	`source` text DEFAULT 'manual' NOT NULL,
	`source_detail` text,
	`verification_status` text DEFAULT 'unverified' NOT NULL,
	`bounce_risk` text DEFAULT 'unknown' NOT NULL,
	`subscription_status` text DEFAULT 'subscribed' NOT NULL,
	`unsubscribed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `edm_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`group_id`) REFERENCES `edm_contact_groups`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `edm_idx_contacts_email` ON `edm_contacts` (`email`);
--> statement-breakpoint
CREATE INDEX `edm_idx_contacts_user` ON `edm_contacts` (`user_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_contacts_group` ON `edm_contacts` (`group_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_contacts_subscription` ON `edm_contacts` (`subscription_status`);
--> statement-breakpoint
CREATE TABLE `edm_campaign_recipients` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`contact_id` text NOT NULL,
	`variables` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`ses_message_id` text,
	`sent_at` integer,
	`delivered_at` integer,
	`opened_at` integer,
	`clicked_at` integer,
	`replied_at` integer,
	`error_message` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `edm_campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `edm_contacts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `edm_idx_recipients_campaign` ON `edm_campaign_recipients` (`campaign_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_recipients_contact` ON `edm_campaign_recipients` (`contact_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_recipients_status` ON `edm_campaign_recipients` (`status`);
--> statement-breakpoint
CREATE TABLE `edm_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`template_id` text,
	`name` text NOT NULL,
	`sender_email` text NOT NULL,
	`sender_name` text NOT NULL,
	`reply_to` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`send_rate` integer DEFAULT 50,
	`total_recipients` integer DEFAULT 0 NOT NULL,
	`total_sent` integer DEFAULT 0 NOT NULL,
	`total_delivered` integer DEFAULT 0 NOT NULL,
	`total_opened` integer DEFAULT 0 NOT NULL,
	`total_clicked` integer DEFAULT 0 NOT NULL,
	`total_replied` integer DEFAULT 0 NOT NULL,
	`total_bounced` integer DEFAULT 0 NOT NULL,
	`total_complained` integer DEFAULT 0 NOT NULL,
	`total_unsubscribed` integer DEFAULT 0 NOT NULL,
	`scheduled_at` integer,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `edm_users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`template_id`) REFERENCES `edm_templates`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `edm_idx_campaigns_user` ON `edm_campaigns` (`user_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_campaigns_status` ON `edm_campaigns` (`status`);
--> statement-breakpoint
CREATE TABLE `edm_crm_contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`contact_id` text NOT NULL,
	`campaign_id` text,
	`status` text DEFAULT 'new' NOT NULL,
	`reply_content` text,
	`reply_sentiment` text,
	`tags` text,
	`notes` text,
	`last_contacted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `edm_contacts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `edm_campaigns`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `edm_idx_crm_contact` ON `edm_crm_contacts` (`contact_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_crm_status` ON `edm_crm_contacts` (`status`);
--> statement-breakpoint
CREATE TABLE `edm_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`subject` text NOT NULL,
	`body_html` text NOT NULL,
	`body_text` text,
	`variables` text,
	`category` text,
	`is_ai_generated` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `edm_users`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `edm_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`name` text NOT NULL,
	`api_key` text NOT NULL,
	`config` text,
	`is_default` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `edm_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `edm_idx_providers_user` ON `edm_providers` (`user_id`);
ALTER TABLE `edm_campaigns` ADD COLUMN `mailchimp_campaign_id` text;
CREATE TABLE `edm_site_message_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`sender_name` text NOT NULL,
	`sender_email` text NOT NULL,
	`sender_phone` text,
	`company` text,
	`address` text,
	`country` text,
	`city` text,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`total_targets` integer DEFAULT 0 NOT NULL,
	`total_submitted` integer DEFAULT 0 NOT NULL,
	`total_skipped` integer DEFAULT 0 NOT NULL,
	`total_failed` integer DEFAULT 0 NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `edm_users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `edm_idx_site_message_jobs_user` ON `edm_site_message_jobs` (`user_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_site_message_jobs_status` ON `edm_site_message_jobs` (`status`);
--> statement-breakpoint
CREATE TABLE `edm_site_message_targets` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`website_url` text NOT NULL,
	`normalized_host` text NOT NULL,
	`contact_page_url` text,
	`status` text DEFAULT 'queued' NOT NULL,
	`result_code` text,
	`result_message` text,
	`detected_fields` text,
	`attempts` integer DEFAULT 0 NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `edm_site_message_jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `edm_idx_site_message_targets_job` ON `edm_site_message_targets` (`job_id`);
--> statement-breakpoint
CREATE INDEX `edm_idx_site_message_targets_status` ON `edm_site_message_targets` (`status`);
--> statement-breakpoint
CREATE INDEX `edm_idx_site_message_targets_host` ON `edm_site_message_targets` (`normalized_host`);
ALTER TABLE `edm_site_message_targets` ADD `progress_stage` text DEFAULT 'queued' NOT NULL;
--> statement-breakpoint
ALTER TABLE `edm_site_message_targets` ADD `progress_percent` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `edm_site_message_targets` ADD `progress_logs` text DEFAULT '[]' NOT NULL;
ALTER TABLE `edm_site_message_targets` ADD `position` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
UPDATE `edm_site_message_targets` AS current
SET `position` = (
  SELECT COUNT(*) - 1
  FROM `edm_site_message_targets` AS earlier
  WHERE earlier.`job_id` = current.`job_id`
    AND earlier.rowid <= current.rowid
);
--> statement-breakpoint
CREATE INDEX `edm_idx_site_message_targets_job_position`
ON `edm_site_message_targets` (`job_id`, `position`);
CREATE TABLE IF NOT EXISTS edm_email_send_attempts (
  recipient_id TEXT PRIMARY KEY REFERENCES edm_campaign_recipients(id) ON DELETE CASCADE,
  started_at INTEGER NOT NULL,
  result TEXT
);
CREATE TABLE IF NOT EXISTS edm_contact_import_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES edm_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  group_id TEXT,
  group_name TEXT NOT NULL,
  overwrite INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  processed INTEGER NOT NULL DEFAULT 0,
  imported INTEGER NOT NULL DEFAULT 0,
  updated INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS edm_idx_import_jobs_user ON edm_contact_import_jobs(user_id, created_at);
CREATE TABLE IF NOT EXISTS edm_contact_import_batches (
  job_id TEXT NOT NULL REFERENCES edm_contact_import_jobs(id) ON DELETE CASCADE,
  batch_index INTEGER NOT NULL,
  PRIMARY KEY (job_id, batch_index)
);
CREATE TABLE IF NOT EXISTS edm_contact_import_rows (
  job_id TEXT NOT NULL REFERENCES edm_contact_import_jobs(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL,
  reason TEXT NOT NULL,
  PRIMARY KEY (job_id, row_number)
);

ALTER TABLE edm_site_message_jobs ADD COLUMN total_abnormal INTEGER NOT NULL DEFAULT 0;
ALTER TABLE edm_site_message_jobs ADD COLUMN total_no_contact INTEGER NOT NULL DEFAULT 0;
ALTER TABLE edm_site_message_jobs ADD COLUMN total_inaccessible INTEGER NOT NULL DEFAULT 0;
