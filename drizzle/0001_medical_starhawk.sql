CREATE TABLE `run_receipts` (
	`id` text PRIMARY KEY NOT NULL,
	`profile_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `profiles` ADD `game_state` text DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `revision` integer DEFAULT 0 NOT NULL;