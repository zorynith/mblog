export type ValidCoinType = "freecoin" | "vipcoin"; 
type HomepageContent = "blog" | "home";

export type SessionUser = {
  id?: number;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string;
  isSubscribed?: number;
  accountbySocial?: string;
};
// 更新后的类型定义，允许 SessionUser 为 null
//update type definition, allow SessionUser to be null
export type NullableSessionUser = SessionUser | null;