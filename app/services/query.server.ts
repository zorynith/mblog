import { drizzle } from "drizzle-orm/d1";
import { eq, and, sql, asc, desc, or, ne, gte } from "drizzle-orm";
import { json } from "@remix-run/cloudflare";
import { coin_log, posts, task, users, userSocialLogins, paymentRecords, collections, tags, postTags, assets, user_options } from "~/db/d1/schema";
import logger from "~/utils/logger";
import { hashPassword } from "~/services/auth.server";
import { slugify } from "~/utils/tools";
import type { PostOrder } from '~/db/d1/schema';
import { ValidCoinType } from "~/types/app"


const CACHE_TTL = 60 * 30; // 30分钟缓存
const POSTS_CACHE_KEY = 'posts_list_';

//home page
interface BlogListData {
  list: any[];
  total: number;
  tagCloud: any[];
}

export async function getBlogListData(
  env: Env,
  page: number,
  pageSize: number,
  cache: boolean = false
): Promise<BlogListData> {
  const cacheKey = `blog_data_${page}_${pageSize}`;

  // 尝试从缓存获取
  if (cache) {
    const cached = await env.KV.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // 并行获取所有数据
  const [list, total, tagCloud] = await Promise.all([
    get_post_list(env, page, pageSize, "published", false),
    get_post_list_count(env),
    get_tag_cloud(env)
  ]);

  const data = { list, total, tagCloud };

  // 存入缓存
  if (cache) {
    await env.KV.put(cacheKey, JSON.stringify(data), { expirationTtl: 60 * 5 });
  }

  return data;
}


export async function clearBlogCache(env: Env) {
  const keys = await env.KV.list({ prefix: 'blog_data_' });
  await Promise.all(keys.keys.map(key => env.KV.delete(key.name)));
}

// -- post series  --

export const get_post_list_count = async (env: Env, status: string = "published") => {
  const d1db = drizzle(env.DB);
  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(posts.status, status));
  }

  const count = await d1db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(and(...conditions))
    .get();

  return count?.count || 0;
};

export const get_post_list = async (
  env: Env,
  page: number = 1,
  pageSize: number = 10,
  status: string = "published",
  cache: boolean = false
) => {


  const cacheKey = `posts_list_${page}_${pageSize}`;

  // 如果启用缓存且存在缓存数据，直接返回
  if (cache) {
    const cached = await env.KV.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }


  const d1db = drizzle(env.DB);

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(eq(posts.status, status));
  }
  const data_list = await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);


  // 如果启用缓存，将数据写入缓存
  if (cache) {
    await env.KV.put(cacheKey, JSON.stringify(data_list), { expirationTtl: CACHE_TTL });
  }

  return data_list;
};

export async function get_random_post_list(env: Env, limit: number, seed?: number, status: string = "published") {
  const d1db = drizzle(env.DB);

  if (seed !== undefined) {
    // 使用固定种子生成伪随机排序
    return await d1db
      .select({
        id: posts.id,
        title: posts.title,
        createdAt: posts.createdAt,
        slug: posts.slug,
        author: posts.author,
        shortDescription: posts.shortDescription,
        status: posts.status,
        featuredImage: posts.featuredImage,
        collectionId: posts.collectionId,
      })
      .from(posts)
      .orderBy(sql`((id * ${seed}) % 100)`)
      .limit(limit)
      .all();
  }

  // 原有的随机逻辑
  return await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .orderBy(sql`RANDOM()`)
    .limit(limit)
    .all();
}

export const check_slug = async (env: Env, slug: string) => {
  const d1db = drizzle(env.DB);
  const id = await d1db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .get();
  return id;
};

export const get_post_list_by_category = async (
  env: Env,
  category: string,
  page: number,
  pageSize: number
) => {
  const d1db = drizzle(env.DB);
  const postslist = await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .where(eq(posts.category, category))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  return postslist;
};

export const get_post_detail_by_id = async (env: Env, id: number) => {
  const d1db = drizzle(env.DB);
  const post = await d1db.select().from(posts).where(eq(posts.id, id)).get();
  return post;
};

export const get_post_detail_by_slug = async (env: Env, slug: string) => {
  const d1db = drizzle(env.DB);
  const post = await d1db
    .select()
    .from(posts)
    .where(eq(posts.slug, slug))
    .get();
  return post;
};

export const create_post = async (env: Env, post: any) => {
  const d1db = drizzle(env.DB);
  const newPost = await d1db.insert(posts).values(post).returning();

  // clear blog cache
  await clearBlogCache(env);
  return newPost[0];
};

export const update_post = async (env: Env, id: number, post: any) => {
  const d1db = drizzle(env.DB);
  const updatedPost = await d1db
    .update(posts)
    .set(post)
    .where(eq(posts.id, id));

  // clear blog cache
  await clearBlogCache(env);

  return updatedPost;
};

export const post_delete = async (env: Env, id: number) => {
  const d1db = drizzle(env.DB);
  await d1db.delete(posts).where(eq(posts.id, id));
  return true;
};

// tag series and collection series
// 示例查询：获取标签云数据
const getTagCloud = async (env: Env) => {
  const d1db = drizzle(env.DB);
  const tagCloud = await d1db
    .select()
    .from(tags)
    .orderBy(desc(tags.count))
    .limit(50)
    .all();
  return tagCloud;
};

// 获取文章的所有标签
//get all tags of a post
export async function getPostTags(env: Env, postId: number) {
  const d1db = drizzle(env.DB);
  return await d1db
    .select({
      id: postTags.id,
      postId: postTags.postId,
      tagId: postTags.tagId,
      tag: {
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
        count: tags.count
      }
    })
    .from(postTags)
    .leftJoin(tags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId))
    .all();
}

// 根据slug获取标签
//get tag by slug
export async function getTagBySlug(env: Env, slug: string) {
  const d1db = drizzle(env.DB);
  return await d1db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .get();
}

// 创建新标签
//create new tag
export async function createTag(env: Env, name: string, slug: string) {
  const d1db = drizzle(env.DB);
  const [newTag] = await d1db
    .insert(tags)
    .values({
      name,
      slug,
      count: 1
    })
    .returning();
  return newTag;
}

// 更新标签计数
//update tag count
export async function updateTagCount(env: Env, tagId: number, increment: boolean) {
  const d1db = drizzle(env.DB);
  await d1db
    .update(tags)
    .set({
      count: increment ? sql`count + 1` : sql`count - 1`
    })
    .where(eq(tags.id, tagId));
}

// 检查文章-标签关联是否存在
//check if post tag exists
export async function checkPostTagExists(env: Env, postId: number, tagId: number) {
  const d1db = drizzle(env.DB);
  const existingTag = await d1db
    .select()
    .from(postTags)
    .where(
      and(
        eq(postTags.postId, postId),
        eq(postTags.tagId, tagId)
      )
    )
    .get();
  return !!existingTag;
}

// 创建文章-标签关联
//create post tag
export async function createPostTag(env: Env, postId: number, tagId: number) {
  // 先检查是否已存在
  const exists = await checkPostTagExists(env, postId, tagId);
  if (exists) {
    return; // 如果已存在，直接返回
  }

  const d1db = drizzle(env.DB);
  await d1db
    .insert(postTags)
    .values({
      postId,
      tagId
    });
}

// 删除文章-标签关联
//delete post tag
export async function deletePostTag(env: Env, postId: number, tagId: number) {
  const d1db = drizzle(env.DB);
  await d1db
    .delete(postTags)
    .where(
      and(
        eq(postTags.postId, postId),
        eq(postTags.tagId, tagId)
      )
    );
}

// 处理文章标签
//handle post tags
export async function handlePostTags(env: Env, postId: number, tagsString: string) {
  // 将标签字符串分割成数组并清理
  if (!tagsString) return;

  const tagNames = tagsString.replace(/，/g, ",")
    .split(",")
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .filter(tag => {
      // 移除所有空格
      const trimmedTag = tag.replace(/\s/g, '');
      // 检查是否为纯数字（包括小数和负数）
      return !(/^-?\d*\.?\d+$/.test(trimmedTag));
    });

  // 如果过滤后没有有效标签，直接返回
  if (tagNames.length === 0) return;

  // 获取现有的文章-标签关联
  const existingPostTags = await getPostTags(env, postId);

  // 处理每个标签
  for (const tagName of tagNames) {
    const tagSlug = slugify(tagName);

    // 查找或创建标签
    let tag = await getTagBySlug(env, tagSlug);

    if (!tag) {
      // 创建新标签
      tag = await createTag(env, tagName, tagSlug);
    } else {
      // 只有在新建关联时才更新计数
      const existingPostTag = existingPostTags.find(
        pt => pt.tagId === tag!.id
      );
      if (!existingPostTag) {
        await updateTagCount(env, tag.id, true);
      }
    }

    // 创建文章-标签关联（如果不存在）
    await createPostTag(env, postId, tag.id);
  }

  // 删除不再使用的标签关联
  const d1db = drizzle(env.DB);
  const currentTags = await d1db
    .select()
    .from(tags)
    .where(
      or(...tagNames.map(name => eq(tags.name, name)))
    )
    .all();

  const tagIdsToKeep = new Set(currentTags.map(t => t.id));

  for (const oldPostTag of existingPostTags) {
    if (!tagIdsToKeep.has(oldPostTag.tagId)) {
      // 删除关联
      await deletePostTag(env, postId, oldPostTag.tagId);
      // 减少标签计数
      await updateTagCount(env, oldPostTag.tagId, false);
    }
  }
}


// 获取标签云数据
//get tag cloud data
export async function get_tag_cloud(env: Env) {
  const d1db = drizzle(env.DB);
  return await d1db
    .select({
      id: tags.id,
      name: tags.name,
      slug: tags.slug,
      count: tags.count
    })
    .from(tags)
    .where(
      and(
        gte(tags.count, 1), // 只获取至少被使用过一次的标签
      )
    )
    .orderBy(desc(tags.count))
    .limit(50) // 限制显示数量，避免太多
    .all();
}


export async function getTagPostsBySlug(env: Env, slug: string) {
  const d1db = drizzle(env.DB);

  // 先获取标签信息
  const tag = await d1db
    .select()
    .from(tags)
    .where(eq(tags.slug, slug))
    .get();

  if (!tag) return { tag: null, posts: [] };

  // 获取带有这个标签的所有文章
  const taggedPosts = await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .innerJoin(postTags, eq(posts.id, postTags.postId))
    .where(eq(postTags.tagId, tag.id))
    .orderBy(desc(posts.createdAt))
    .all();

  return {
    tag,
    posts: taggedPosts
  };
}


export async function getTagPostsById(env: Env, id: number) {
  const d1db = drizzle(env.DB);

  // 先获取标签信息
  const tag = await d1db
    .select()
    .from(tags)
    .where(eq(tags.id, id))
    .get();

  if (!tag) return { tag: null, posts: [] };

  // 获取带有这个标签的所有文章
  const taggedPosts = await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .innerJoin(postTags, eq(posts.id, postTags.postId))
    .where(eq(postTags.tagId, tag.id))
    .orderBy(desc(posts.createdAt))
    .all();

  return {
    tag,
    posts: taggedPosts
  };
}


// --- collection series
// 获取所有集合列表
export async function get_collection_list(env: Env, isPublished: boolean = true) {
  const d1db = drizzle(env.DB);
  return await d1db.select({
    id: collections.id,
    name: collections.name,
    slug: collections.slug,
    coverImage: collections.coverImage,
    description: sql<string>`SUBSTR(${collections.description}, 1, 200)`,
    createdAt: collections.createdAt,
  }).from(collections).where(eq(collections.isPublished, isPublished)).orderBy(desc(collections.createdAt));
}



// 获取所有集合列表
//get all collection list with posts count
export async function get_collection_list_with_posts_count(env: Env) {
  const d1db = drizzle(env.DB);

  return await d1db
    .select({
      id: collections.id,
      name: collections.name,
      slug: collections.slug,
      description: collections.description,
      coverImage: collections.coverImage,
      isPublished: collections.isPublished,
      postsCount: sql<number>`
        CASE 
          WHEN ${collections.postsOrder} IS NULL THEN 0
          ELSE json_array_length(${collections.postsOrder})
        END
      `,
      createdAt: collections.createdAt,
    })
    .from(collections)
    .orderBy(desc(collections.createdAt));
}


// 创建新集合
//create new collection
export async function create_collection(env: Env, data: {
  name: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  isPublished?: boolean;
}) {
  const d1db = drizzle(env.DB);

  // 如果用户提供了 slug，也进行 slugify 处理
  const slug = data.slug?.trim()
    ? slugify(data.slug)
    : slugify(data.name);

  return await d1db
    .insert(collections)
    .values({
      name: data.name,
      slug,
      description: data.description,
      coverImage: data.coverImage,
      isPublished: data.isPublished,
    })
    .returning();
}

// 删除集合
//delete collection
export async function delete_collection(env: Env, id: number) {
  const d1db = drizzle(env.DB);

  try {
    // 1. 先更新相关文章的 collectionId 为 null
    await d1db
      .update(posts)
      .set({ collectionId: null })
      .where(eq(posts.collectionId, id));

    // 2. 然后删除集合
    await d1db
      .delete(collections)
      .where(eq(collections.id, id));

    return true;
  } catch (error) {
    console.error("Delete collection error:", error);
    throw error;
  }
}


// 切换集合发布状态
//toggle collection publish status
export async function toggle_collection_publish(env: Env, id: number, isPublished: boolean) {
  const d1db = drizzle(env.DB);

  const result = await d1db
    .update(collections)
    .set({ isPublished })
    .where(eq(collections.id, id))
    .returning();

  return result[0];
}


//更新集合基础信息
//update collection basic info
export async function update_collection(env: Env, data: {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  isPublished?: boolean;
}) {
  const d1db = drizzle(env.DB);

  // 同样处理更新时的 slug
  const slug = data.slug?.trim()
    ? slugify(data.slug)
    : slugify(data.name);

  return await d1db
    .update(collections)
    .set({
      name: data.name,
      slug,
      description: data.description,
      coverImage: data.coverImage,
      isPublished: data.isPublished,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(collections.id, data.id))
    .returning();
}

// 将文章添加到集合
//add post to collection
export async function addPostToCollection(
  env: Env,
  postId: number,
  collectionId: number,
  oldCollectionId: number = 0
) {

  // console.log("addPostToCollection query类", postId, collectionId, oldCollectionId);
  const d1db = drizzle(env.DB);

  // 1. 如果存在旧集合，先从旧集合中移除
  if (oldCollectionId !== 0) {
    const oldCollection = await removePostFromCollection(env, postId, oldCollectionId);
  }

  // 2. 获取新集合信息并更新
  const collection = await d1db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) return null;  // 如果集合不存在，返回 null

  // 确保 currentOrder 是数组
  const currentOrder: PostOrder[] = Array.isArray(collection.postsOrder)
    ? collection.postsOrder
    : (collection.postsOrder ? JSON.parse(collection.postsOrder as string) : []);

  // 检查文章是否已经在集合中
  if (!currentOrder.some(item => item.id === postId)) {
    // 计算最大的 order 值
    const maxOrder = currentOrder.length > 0
      ? Math.max(...currentOrder.map(item => item.order))
      : -1;

    const newOrder = [...currentOrder, { id: postId, order: maxOrder + 1 }];

    // console.log("newOrder", newOrder);

    await d1db
      .update(collections)
      .set({ postsOrder: newOrder })
      .where(eq(collections.id, collectionId));
  }
}

// 从集合中移除文章
//remove post from collection
export async function removePostFromCollection(
  env: Env,
  postId: number,
  collectionId: number
) {
  const d1db = drizzle(env.DB)
  // 2. 获取并更新集合的 postsOrder
  const collection = await d1db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) return null;

  // 确保 currentOrder 是数组
  const currentOrder: PostOrder[] = Array.isArray(collection.postsOrder)
    ? collection.postsOrder
    : (collection.postsOrder ? JSON.parse(collection.postsOrder as string) : []);


  const newOrder = currentOrder
    .filter(item => item.id !== postId)
    .map((item, index) => ({ ...item, order: index }));

  return await d1db
    .update(collections)
    .set({ postsOrder: newOrder })
    .where(eq(collections.id, collectionId));
}

// 更新集合中文章的顺序
//update collection order
export async function updateCollectionOrder(
  env: Env,
  collectionId: number,
  newOrder: { id: number; order: number }[]
) {
  const d1db = drizzle(env.DB);

  return await d1db
    .update(collections)
    .set({
      postsOrder: JSON.stringify(newOrder),
      updatedAt: sql`current_timestamp`
    })
    .where(eq(collections.id, collectionId));
}

// 获取集合中的文章（按顺序）
//get collection posts in order
export async function getCollectionPosts(
  env: Env,
  collectionId: number
) {
  const d1db = drizzle(env.DB);

  // 1. 获取集合信息和排序
  const collection = await d1db
    .select()
    .from(collections)
    .where(eq(collections.id, collectionId))
    .get();

  if (!collection) return null;

  const postsOrder: PostOrder[] = collection.postsOrder as PostOrder[];

  // 2. 获取所有相关文章
  const collectionPosts = await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .where(eq(posts.collectionId, collectionId))
    .all();

  // 3. 按照 postsOrder 排序
  return collectionPosts.sort((a, b) => {
    const orderA = postsOrder.find(p => p.id === a.id)?.order ?? 0;
    const orderB = postsOrder.find(p => p.id === b.id)?.order ?? 0;
    return orderA - orderB;
  });
}

export async function getCollectionPostsBySlug(env: Env, slug: string) {
  const d1db = drizzle(env.DB);
  const collection = await d1db.select().from(collections).where(eq(collections.slug, slug)).get();
  if (!collection) return { collection: null, posts: null };
  const postsOrder: PostOrder[] = collection.postsOrder as PostOrder[];
  const posts = await getCollectionPosts(env, collection.id);

  return {
    collection,
    posts
  }
}

// 更新集合中文章的顺序
//update collection order
export async function update_collection_order(env: Env, collectionId: number, newOrder: PostOrder[]) {
  const d1db = drizzle(env.DB);

  return await d1db
    .update(collections)
    .set({
      postsOrder: newOrder,
      updatedAt: new Date().toISOString()
    })
    .where(eq(collections.id, collectionId));
}

// 获取集合详情
//get collection detail
export async function get_collection_detail(env: Env, id: number) {
  const d1db = drizzle(env.DB);

  // 获取集合基本信息
  const collection = await d1db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .get();

  if (!collection) {
    throw new Error("Collection not found");
  }

  // 获取相关文章
  const collectionPosts = await d1db
    .select({
      id: posts.id,
      title: posts.title,
      createdAt: posts.createdAt,
      slug: posts.slug,
      author: posts.author,
      shortDescription: posts.shortDescription,
      status: posts.status,
      featuredImage: posts.featuredImage,
      collectionId: posts.collectionId,
    })
    .from(posts)
    .where(eq(posts.collectionId, id))
    .all();

  // 处理排序
  const postsOrder = Array.isArray(collection.postsOrder)
    ? collection.postsOrder
    : (collection.postsOrder ? JSON.parse(collection.postsOrder as string) : []);

  // 根据 postsOrder 对文章进行排序
  const sortedPosts = collectionPosts.sort((a, b) => {
    const orderA = postsOrder.find((p: PostOrder) => p.id === a.id)?.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = postsOrder.find((p: PostOrder) => p.id === b.id)?.order ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  return {
    ...collection,
    posts: sortedPosts
  };
}

// 获取集合信息
//get collection info
export async function get_collection_info(env: Env, id: number) {
  const d1db = drizzle(env.DB);

  // 获取集合基本信息
  const collection = await d1db
    .select()
    .from(collections)
    .where(eq(collections.id, id))
    .get();

  if (!collection) {
    return null;
  }

  return collection;
}

//user options
// 通用的获取用户选项函数
export async function getUserOption(env: Env, userId: string, item: string) {
  const d1db = drizzle(env.DB);

  const option = await d1db
    .select()
    .from(user_options)
    .where(
      and(
        eq(user_options.userId, userId),
        eq(user_options.item, item)
      )
    )
    .get();

  return option?.value ? option.value : null;
}

//-- prompt 

// 获取用户的提示词配置
export async function getPromptOptions(env: Env, userId: string) {
  if (!userId) return {
    continuation: "",
    optimization: "",
    ai_endpoint: "",
    ai_model: "",
    ai_apikey: "",
    cf_text_model: "",
  };
  const prompts = await getUserOption(env, userId, "prompt");
  return prompts || {
    continuation: "",
    optimization: "",
    ai_endpoint: "",
    ai_model: "",
    ai_apikey: "",
    cf_text_model: "",
  };
}



// 更新提示词配置函数
//update prompt options function
export async function updatePromptOptions(env: Env, userId: string, options: {
  continuation: string;
  optimization: string;
  ai_endpoint: string;
  ai_model: string;
  ai_apikey: string;
}) {
  const d1db = drizzle(env.DB);

  const existingOption = await getUserOption(env, userId, "prompt");
  if (existingOption) {
    // 存在则更新
    return await d1db
      .update(user_options)
      .set({
        value: options
      })
      .where(and(
        eq(user_options.userId, userId),
        eq(user_options.item, "prompt")
      ));
  } else {
    // 不存在则插入
    return await d1db
      .insert(user_options)
      .values({
        userId,
        item: "prompt",
        value: options
      })
      .returning();
  }
}

//----   user series  ----

export const get_user_list = async (env: Env) => {
  const d1db = drizzle(env.DB);
  const usersList = await d1db.select().from(users).orderBy(desc(users.createdAt));
  return usersList;
};

export const get_user_by_email = async (env: Env, email: string) => {
  const d1db = drizzle(env.DB);
  const user = await d1db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();
  return user;
};

export const get_user_by_username = async (env: Env, username: string) => {
  const d1db = drizzle(env.DB);
  const user = await d1db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();
  return user;
};

// 创建用户，username 为邮箱，email 为邮箱，passwordHash 为加密后的密码
//create user, username is email, email is email, passwordHash is encrypted password
export const create_user_by_email = async (
  env: Env,
  email: string,
  passwordHash: string,
  extra: any = {}
) => {
  let extraoption = extra;
  const d1db = drizzle(env.DB);
  const user_count = await get_user_count(env);

  const free_coin_when_register = env?.free_coin_when_register || 0;

  let newUser = await d1db
    .insert(users)
    .values({
      username: email,
      email,
      passwordHash,
      freecoin: free_coin_when_register,
    })
    .returning();

  if (newUser[0].id == 1) {
    await d1db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, newUser[0].id));

    newUser[0].role = "admin";
  }

  return newUser[0];
};

export const create_user_by_username = async (env: Env, username: string, accountbySocial = '', source: string = '') => {
  const d1db = drizzle(env.DB);

  const exist_user = await d1db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (exist_user) {
    throw new Error("user exist");
  } else {
    const newUser = await d1db
      .insert(users)
      .values({ username: username, email: username, passwordHash: "", accountbySocial, invite: source })
      .returning();

    return newUser[0];
  }
};

export const get_user_by_userid = async (env: Env, userid: number) => {
  const d1db = drizzle(env.DB);
  const user = await d1db
    .select()
    .from(users)
    .where(eq(users.id, userid))
    .get();
  return user;
};

export const get_user_by_userid_without_password = async (
  env: Env,
  userid: number
) => {
  const d1db = drizzle(env.DB);
  const user = await d1db
    .select({
      id: users.id,
      username: users.username,
      avatar: users.avatar,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      freecoin: users.freecoin,
      vipcoin: users.vipcoin,
      accountbySocial: users.accountbySocial,
      // 添加其他需要的字，但不包括 passwordHash
    })
    .from(users)
    .where(eq(users.id, userid))
    .get();

  return user;
};

export const update_user_by_userid = async (env: Env, userid: number, user: any) => {
  const d1db = drizzle(env.DB);
  const updatedUser = await d1db.update(users).set(user).where(eq(users.id, userid));
  return updatedUser;
};

// 获取用户总数
//get user count
export const get_user_count = async (env: Env) => {
  const d1db = drizzle(env.DB);
  const userscount = await d1db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .get();
  return userscount?.count || 0;
};


export const find_social_user = async (
  env: Env,
  provider: string,
  email: string,
  providerId: string
) => {
  const d1db = drizzle(env.DB);
  const social_user = await d1db
    .select()
    .from(userSocialLogins)
    .where(
      and(
        eq(userSocialLogins.provider, provider),
        eq(userSocialLogins.providerId, providerId)
      )
    )
    .get();
  return social_user;
};

export const find_or_create_social_user = async (
  env: Env,
  provider: string,
  email: string,
  providerId: string,
  extra: any = {}
) => {
  const d1db = drizzle(env.DB);
  const social_user = await find_social_user(env, provider, email, providerId);

  if (social_user) {
    const user = await get_user_by_userid(env, social_user.userId);
    if (user) {
      //正常逻辑应该走这里。
      return user;
    } else {
      // 如果用户不存在，创建新用户
      const newUser = await create_user_by_email(
        env,
        email,
        await hashPassword(Math.random().toString(36).slice(-8)),
        extra
      );
      return newUser;
    }
  }
  //没有social_user，检查用户是否存在
  const user = await get_user_by_email(env, email);
  if (!user) {
    // 如果用户不存在，创建新用户

    const random_password = await hashPassword(
      Math.random().toString(36).slice(-8)
    );

    // 在用户表创建用户
    const newUser = await create_user_by_email(env, email, random_password);

    //在社交表创建关系
    const newSocialUser = await d1db
      .insert(userSocialLogins)
      .values({ userId: newUser.id, provider, providerId, extraParams: extra })
      .returning();

    if (newUser && newSocialUser) {
      return newUser;
    } else {
      throw new Error("创建社交用户失败");
    }
  } else {
    // 如果用户存在,但是关系不存在，插入social_user,这里是可以有多个关系的。比如github，google，facebook等

    logger.info({
      msg: "user exists 如果用户存在,但是关系不存在，插入social_user",
      userId: user.id,
      provider,
      providerId,
      sql,
    });

    let newSocialUser;
    try {
      newSocialUser = await d1db
        .insert(userSocialLogins)
        .values({
          userId: user.id,
          provider,
          providerId,
          extraParams: extra,
        })
        .returning();
    } catch (error) {
      logger.error({
        msg: "创建社交用户失败",
        error,
      });
    }

    if (newSocialUser) {
      return user;
    } else {
      throw new Error("创建社交用户失败");
    }
  }
};


//---- assets series ----
// 获取资产列表
export const get_assets = async (
  env: Env,
  type?: string | undefined,
  category?: string | undefined,
  offset: number = 0,
  limit: number = 10
) => {
  const d1db = drizzle(env.DB);

  const conditions = [];
  if (type) {
    conditions.push(eq(assets.type, type));
  }
  if (category) {
    conditions.push(eq(assets.category, category)); // 添加分类筛选条件
  }

  const assetList = await d1db
    .select()
    .from(assets)
    .where(and(...conditions)) // 使用 and 组合条件
    .limit(limit)
    .offset(offset)
    .execute();

  return assetList;
};

// 创建资产
export const create_asset = async (env: Env, assetData: { title: string; type: string; ext: any; url: string }) => {
  const d1db = drizzle(env.DB);
  const newAsset = await d1db
    .insert(assets)
    .values({
      title: assetData.title,
      type: assetData.type,
      ext: assetData.ext,
      url: assetData.url,
      createdAt: new Date().toISOString(), // 假设有 createdAt 字段
    })
    .returning();

  return newAsset;
};

export async function get_assets_count(env: Env): Promise<number> {
  const d1db = drizzle(env.DB);
  const result = await d1db.select({ count: sql`count(*)` }).from(assets);
  return Number(result[0].count);
}

export async function update_asset(env: Env, id: string, data: {
  title: string;
  category: string;
  type: string;
  ext: string;
  url: string;
}) {
  const d1db = drizzle(env.DB);
  await d1db.update(assets)
    .set(data)
    .where(eq(assets.id, parseInt(id)));
}

// 删除资产
export const delete_asset = async (env: Env, assetId: string) => {
  const d1db = drizzle(env.DB);
  await d1db
    .delete(assets)
    .where(eq(assets.id, assetId))
    .execute();
}

export async function get_assets_by_id(env: Env, assetId: number) {
  const d1db = drizzle(env.DB);
  const asset = await d1db.select().from(assets).where(eq(assets.id, assetId)).get();
  return asset;
}