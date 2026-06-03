ALTER TABLE `user` ADD `role` text;--> statement-breakpoint
ALTER TABLE `user` ADD `roles_json` text DEFAULT '[]';--> statement-breakpoint
ALTER TABLE `user` ADD `permissions_json` text DEFAULT '[]' NOT NULL;