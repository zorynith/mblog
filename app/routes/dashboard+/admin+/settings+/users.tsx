import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Switch } from "~/components/ui/switch";
import { formatDate } from "~/lib/utils";
import { get_user_list, update_user_by_userid } from "~/services/query.server";
import { Button } from "~/components/ui/button";
import { useToast } from "~/hooks/use-toast";
import { useNavigation } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";

interface User {
  id: number;
  email: string;
  username: string | null;
  role: string | null;
  accountStatus: string;
  isSubscribed: boolean;
  freecoin: number;
  vipcoin: number;
  createdAt: Date;
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const users = await get_user_list(env);

  return json({ users });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare as { env: Env };
  const formData = await request.formData();
  const intent = formData.get("intent");
  const userId = Number(formData.get("userId"));

  if (!userId || isNaN(userId)) {
    return json({ error: "无效的用户ID" }, { status: 400 });
  }

  try {
    switch (intent) {
      case "edit": {
        const email = formData.get("email") as string;
        const username = formData.get("username") as string;
        const role = formData.get("role") as string;
        const accountStatus = formData.get("accountStatus") as string;
        const isSubscribed = formData.get("isSubscribed") === "true";
        const freecoin = Number(formData.get("freecoin"));
        const vipcoin = Number(formData.get("vipcoin"));

        if (!email) {
          return json({ error: "邮箱不能为空" }, { status: 400 });
        }

        await update_user_by_userid(env, userId, {
          email,
          username: username || null,
          role: role || null,
          accountStatus,
          isSubscribed,
          freecoin,
          vipcoin,
        });
        
        return json({ success: true, message: "用户更新成功" });
      }
      
      case "delete": {
        await update_user_by_userid(env, userId, { accountStatus: "deleted" });
        return json({ success: true, message: "用户删除成功" });
      }
      
      default:
        return json({ error: "无效的操作类型" }, { status: 400 });
    }
  } catch (error) {
    console.error("User operation failed:", error);
    return json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
}

export default function UsersList() {
  const { t } = useTranslation();
  const { users } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const isSubmitting = navigation.state === "submitting";
  const { toast } = useToast();
  const fetcher = useFetcher();

  useEffect(() => {
    if (fetcher.data?.success) {
      toast({
        title: t("success"),
        description: fetcher.data.message,
      });
      setEditingUser(null);
      setUserToDelete(null);
    } else if (fetcher.data?.error) {
      toast({
        title: "错误",
        description: fetcher.data.error,
        variant: "destructive",
      });
    }
  }, [fetcher.data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("user_management")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {/* 移动端布局 */}
        <div className="block md:hidden">
          {users.map((user) => (
            <div key={user.id} className="border-b p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="font-medium">{user.username}</div>
                <Badge variant={user.status === 'active' ? 'success' : 'destructive'}>
                  {t(user.status)}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {user.email}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("role")}: </span>
                  {user.role ? t(user.role) : "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">{t("coins")}: </span>
                  {user.freecoin}/{user.vipcoin}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 桌面端布局 */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("username")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("freecoin")} / {t("vipcoin")}</TableHead>
                <TableHead>{t("is_subscribed")}</TableHead>
                <TableHead>{t("createdAt")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username || "-"}</TableCell>
                  <TableCell>{user.role || "-"}</TableCell>
                  <TableCell>{user.freecoin || 0} / {user.vipcoin || 0}</TableCell>
                  <TableCell>{user.isSubscribed ? t("yes") : t("no")}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{user.accountStatus || "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditingUser(user)}
                      disabled={isSubmitting}
                    >
                      {t("edit")}    
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setUserToDelete(user)}
                      disabled={isSubmitting}
                      className="text-destructive hover:text-destructive"
                    >
                      {t("delete")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 编辑对话框 */}
        <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("edit")} {t("user")}</DialogTitle>
            </DialogHeader>
            <fetcher.Form method="post" className="space-y-4">
              <input type="hidden" name="intent" value="edit" />
              <input type="hidden" name="userId" value={editingUser?.id} />
              
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  defaultValue={editingUser?.email}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">{t("username")}</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={editingUser?.username || ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">{t("role")}</Label>
                <Select name="role" defaultValue={editingUser?.role || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t("admin")}</SelectItem>
                    <SelectItem value="user">{t("user")}</SelectItem>
                    <SelectItem value="editor">{t("editor")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountStatus">{t("account_status")}</Label>
                <Select name="accountStatus" defaultValue={editingUser?.accountStatus || "active"}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="deleted">{t("deleted")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isSubscribed">{t("is_subscribed")}</Label>
                <Select name="isSubscribed" defaultValue={String(editingUser?.isSubscribed)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("yes")}</SelectItem>
                    <SelectItem value="false">{t("no")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="freecoin">{t("freecoin")}</Label>
                <Input
                  id="freecoin"
                  name="freecoin"
                  type="number"
                  defaultValue={editingUser?.freecoin || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vipcoin">{t("vipcoin")}</Label>
                <Input
                  id="vipcoin"
                  name="vipcoin"
                  type="number"
                  defaultValue={editingUser?.vipcoin || 0}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存"}
                </Button>
              </DialogFooter>
            </fetcher.Form>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                您确定要删除用户 {userToDelete?.email} 吗？此操作无法撤销。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <fetcher.Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <input type="hidden" name="userId" value={userToDelete?.id} />
                <AlertDialogAction asChild>
                  <Button type="submit" variant="destructive" disabled={isSubmitting}>
                    {isSubmitting ? "删除中..." : "确认删除"}
                  </Button>
                </AlertDialogAction>
              </fetcher.Form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
