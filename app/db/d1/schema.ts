import { InferSelectModel, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  real,
} from "drizzle-orm/sqlite-core";

// 简单的唯一ID生成函数
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const posts = sqliteTable(
  "posts",
  {
    // id is set on insert, incrementing
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),

    // title of the blog post
    title: text("title", { length: 256 }).notNull().default(""),

    // content of the blog post
    content: text("content").notNull().default(""),
    // content of the blog post
    contentjson: text("contentjson", { mode: "json" }).default(
      JSON.stringify({})
    ),

    //author of the blog post
    author: text("author", { length: 256 }).default(""),

    // tags for the blog post (comma-separated string)
    tags: text("tags"),

    // short description of the blog post
    shortDescription: text("short_description", { length: 500 }).default(""),

    // SEO title
    seoTitle: text("seo_title", { length: 60 }).default(""),

    // SEO description
    seoDescription: text("seo_description", { length: 160 }).default(""),

    // NEW: featured image URL
    featuredImage: text("featured_image"),

    // slug for SEO-friendly URLs
    slug: text("slug").notNull(),
    outline: text("outline", { mode: "json" }).default(JSON.stringify({})),

    // status of the post (draft, published, archived)
    status: text("status", { length: 20 }).default("draft"),
    draft: text("draft", { mode: "json" }),
    extra: text("extra", { mode: "json" }).default({}),
    collectionId: integer("collection_id").default(-1), // 可以为 null，表示不属于任何集合
    // NEW: allow comments flag
    allowComments: integer("allow_comments", { mode: "boolean" }).default(true),
    origin_url: text("origin_url").default(""),
    auto_redirect: integer("auto_redirect", { mode: "boolean" }).default(false),

    language: text("language", { length: 20 }).default("zh"),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`current_timestamp`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`current_timestamp`)
      .$onUpdate(() => sql`current_timestamp`),
  },
  (table) => {
    return {
      uniqueSlug_idx: uniqueIndex("unique_slug").on(table.slug),
      status_idx: index("post_status_idx").on(table.status),
      createdAt_idx: index("createdAt_idx").on(table.createdAt),
      collectionIndex: index("collection_idx").on(table.collectionId),
    };
  }
);

export type Post = InferSelectModel<typeof posts>;

export const users = sqliteTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    gid: text("gid").$defaultFn(() => generateId()),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    email: text("email").notNull().unique(),
    invite: text("invite").default(""),
    role: text("role").default("user"), // 'user' or 'admin'
    avatar: text("avatar"),
    freecoin: integer("freecoin").default(0),
    vipcoin: integer("vipcoin").default(0),
    isSubscribed: integer("is_subscribed").default(0), // 0: not subscribed, 1: subscribed
    language: text("language", { length: 20 }).default("en"),
    accountStatus: text("status", { length: 20 }).default("active"), // 'active' or 'deleted'
    accountbySocial: text("accountbySocial", { length: 20 }).default(""), // 'google' or 'telegram' or 'line'
    // Add other social login IDs as needed
    createdAt: text("createdAt")
      .notNull()
      .default(sql`current_timestamp`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`current_timestamp`)
      .$onUpdate(() => sql`current_timestamp`),
  },
  (table) => {
    return {
      gid_idx: index("gid_idx").on(table.gid),
      email_idx: index("email_idx").on(table.email),
      username_idx: index("username_idx").on(table.username),
    };
  }
);

export type User = InferSelectModel<typeof users>;

export type UserSocialLogin = InferSelectModel<typeof userSocialLogins>;

export const userSocialLogins = sqliteTable(
  "user_social_logins",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    provider: text("provider").notNull(), // e.g., 'google', 'facebook', 'telegram', 'line'
    providerId: text("provider_id").notNull(),
    extraParams: text("extra_params", { mode: "json" }).default(""),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`current_timestamp`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`current_timestamp`)
      .$onUpdate(() => sql`current_timestamp`),
  },
  (table) => {
    return {
      user_provider_idx: index("user_provider_idx").on(
        table.userId,
        table.provider
      ),
      provider_id_idx: index("provider_id_idx").on(
        table.provider,
        table.providerId
      ),
      unique_provider_id: uniqueIndex("unique_provider_id").on(
        table.provider,
        table.providerId
      ), // 添加唯一约束
    };
  }
);

// 用户选项
export const user_options = sqliteTable(
  "user_options",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id").notNull(),
    item: text("item").notNull(),
    value: text("value", { mode: "json" }).default(""),
  },
  (table) => ({
    unique_user_item: uniqueIndex("unique_user_item").on(
      table.userId,
      table.item
    ),
  })
);

// 标签表
export const tags = sqliteTable(
  "tags",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    count: integer("count").notNull().default(0), // 使用该标签的文章数量
    createdAt: text("createdAt")
      .notNull()
      .default(sql`current_timestamp`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`current_timestamp`)
      .$onUpdate(() => sql`current_timestamp`),
  },
  (table) => ({
    nameIndex: uniqueIndex("tag_name_idx").on(table.name),
    slugIndex: uniqueIndex("tag_slug_idx").on(table.slug),
  })
);

// 文章-标签关联表
export const postTags = sqliteTable(
  "post_tags",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`current_timestamp`),
  },
  (table) => ({
    postTagIndex: uniqueIndex("post_tag_idx").on(table.postId, table.tagId),
    tagPostIndex: index("tag_post_idx").on(table.tagId), // 用于快速查找包含特定标签的文章
  })
);

export type Tag = InferSelectModel<typeof tags>;
export type PostTag = InferSelectModel<typeof postTags>;


// collections 表
export const collections = sqliteTable(
  "collections",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    coverImage: text("cover_image"),
    // 存储该集合下文章的ID和顺序 [{id: 1, order: 1}, {id: 2, order: 2}]
    postsOrder: text("posts_order", { mode: "json" }).$defaultFn(() => []),
    isPublished: integer("is_published", { mode: "boolean" }).notNull().default(true),
    createdAt: text("createdAt")
      .notNull()
      .default(sql`current_timestamp`),
    updatedAt: text("updatedAt")
      .notNull()
      .default(sql`current_timestamp`)
      .$onUpdate(() => sql`current_timestamp`),
  },
  (table) => ({
    slugIndex: uniqueIndex("collection_slug_idx").on(table.slug),
  })
);

// 类型定义
export interface PostOrder {
  id: number;
  order: number;
}

export type Collection = InferSelectModel<typeof collections>;


export const assets = sqliteTable("assets", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title").default(""),
  type: text("type").default(""),
  category: text("category").default(""),
  ext: text("ext", { mode: "json" }).default(""),
  url: text("url").default(""),
  userId: text("user_id").default(""),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`current_timestamp`),
});


export const messages = sqliteTable("messages", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  taskId: text("task_id").notNull(),
  type: text("type").notNull().default(""), // e.g., 'progress', 'success', 'error', 'info'
  msg: text("message").notNull().default(""),
  error: text("error"),
  data: text("data", { mode: "json" }).default(""),
  progress: integer("progress").default(0),
  createdAt: text("createdAt")
    .notNull()
    .default(sql`current_timestamp`),
  updatedAt: text("updatedAt")
    .notNull()
    .default(sql`current_timestamp`)
    .$onUpdate(() => sql`current_timestamp`),
})