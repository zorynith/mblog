CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text DEFAULT '',
	`type` text DEFAULT '',
	`category` text DEFAULT '',
	`ext` text DEFAULT '',
	`url` text DEFAULT '',
	`user_id` text DEFAULT '',
	`createdAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`cover_image` text,
	`posts_order` text,
	`is_published` integer DEFAULT true NOT NULL,
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` text NOT NULL,
	`type` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`error` text,
	`data` text DEFAULT '',
	`progress` integer DEFAULT 0,
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `post_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`post_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text(256) DEFAULT '' NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`contentjson` text DEFAULT '{}',
	`author` text(256) DEFAULT '',
	`tags` text,
	`short_description` text(500) DEFAULT '',
	`seo_title` text(60) DEFAULT '',
	`seo_description` text(160) DEFAULT '',
	`featured_image` text,
	`slug` text NOT NULL,
	`outline` text DEFAULT '{}',
	`status` text(20) DEFAULT 'draft',
	`draft` text,
	`extra` text DEFAULT '{}',
	`collection_id` integer DEFAULT -1,
	`allow_comments` integer DEFAULT true,
	`origin_url` text DEFAULT '',
	`auto_redirect` integer DEFAULT false,
	`language` text(20) DEFAULT 'zh',
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_social_logins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`extra_params` text DEFAULT '',
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_options` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`item` text NOT NULL,
	`value` text DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gid` text,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`email` text NOT NULL,
	`invite` text DEFAULT '',
	`role` text DEFAULT 'user',
	`avatar` text,
	`freecoin` integer DEFAULT 0,
	`vipcoin` integer DEFAULT 0,
	`is_subscribed` integer DEFAULT 0,
	`language` text(20) DEFAULT 'en',
	`status` text(20) DEFAULT 'active',
	`accountbySocial` text(20) DEFAULT '',
	`createdAt` text DEFAULT current_timestamp NOT NULL,
	`updatedAt` text DEFAULT current_timestamp NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `collection_slug_idx` ON `collections` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `post_tag_idx` ON `post_tags` (`post_id`,`tag_id`);--> statement-breakpoint
CREATE INDEX `tag_post_idx` ON `post_tags` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_slug` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `post_status_idx` ON `posts` (`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `posts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `collection_idx` ON `posts` (`collection_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tag_name_idx` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tag_slug_idx` ON `tags` (`slug`);--> statement-breakpoint
CREATE INDEX `user_provider_idx` ON `user_social_logins` (`user_id`,`provider`);--> statement-breakpoint
CREATE INDEX `provider_id_idx` ON `user_social_logins` (`provider`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_provider_id` ON `user_social_logins` (`provider`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `unique_user_item` ON `user_options` (`user_id`,`item`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `gid_idx` ON `users` (`gid`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);