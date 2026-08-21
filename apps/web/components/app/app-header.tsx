"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CircleHelp, LogOut, ScrollText, UserPen } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { BrandLogo } from "@/components/shared/brand-logo";
import { UserDisplay } from "@/components/user/user-display";
import { APP_PROFILE_PATH } from "@/lib/app/routes";
import { wsClient } from "@/lib/ws/client";
import { WsEvents, PushEvents } from "@/lib/ws/events";
import type { NotificationRecord, UserProfile } from "@/lib/ws/types";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { isAdminUser } from "@/lib/app/get-app-blocks";
import { ThemeToggle } from "@/components/landing/theme-toggle";

export function AppHeader({ user }: { user: UserProfile }) {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    const [list, count] = await Promise.all([
      wsClient.rpc<NotificationRecord[]>(WsEvents.NOTIFICATIONS_LIST),
      wsClient.rpc<number>(WsEvents.NOTIFICATIONS_UNREAD_COUNT),
    ]);
    setNotifications(list);
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    void loadNotifications();
    const unsubNew = wsClient.on(PushEvents.NOTIFICATION_NEW, () => {
      void loadNotifications();
    });
    const unsubDelivery = wsClient.on(
      PushEvents.DELIVERY_STATUS_CHANGED,
      () => {
        void loadNotifications();
      },
    );
    return () => {
      unsubNew();
      unsubDelivery();
    };
  }, [loadNotifications]);

  async function markRead(id: string) {
    await wsClient.rpc(WsEvents.NOTIFICATIONS_READ, { notificationId: id });
    void loadNotifications();
  }

  async function markAllRead() {
    await wsClient.rpc(WsEvents.NOTIFICATIONS_READ_ALL);
    void loadNotifications();
  }

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
  const admin = isAdminUser(user);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo href="/app" />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="size-4" />
                  {unreadCount > 0 ? (
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      className="text-primary text-xs font-normal hover:underline"
                      onClick={() => void markAllRead()}
                    >
                      Mark all read
                    </button>
                  ) : null}
                </DropdownMenuLabel>
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-4 text-center text-sm">
                    No notifications yet
                  </p>
                ) : (
                  notifications.slice(0, 8).map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-0.5 py-2"
                      onClick={() => !n.isRead && void markRead(n.id)}
                    >
                      <span className="flex w-full items-center gap-2 font-medium">
                        {!n.isRead ? (
                          <span className="bg-primary size-1.5 shrink-0 rounded-full" />
                        ) : null}
                        {n.title}
                      </span>
                      {n.body ? (
                        <span className="text-muted-foreground line-clamp-2 text-xs">
                          {n.body}
                        </span>
                      ) : null}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-7">
                    {user.profilePhotoUrl ? (
                      <AvatarImage src={user.profilePhotoUrl} alt={user.firstName} />
                    ) : null}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">
                    {user.firstName}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent
              align="end"
              className="w-64 border border-border bg-popover p-2 shadow-lg before:hidden"
            >
              <div className="space-y-2 px-2 py-2">
                <UserDisplay
                  user={user}
                  showAvatar
                  showName
                  showEmail
                  showVerification
                  size="sm"
                />
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="font-normal">
                    {user.profileType.toLowerCase()}
                  </Badge>
                  {admin ? (
                    <Badge variant="outline" className="font-normal">
                      admin
                    </Badge>
                  ) : null}
                </div>
              </div>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuGroup className="space-y-0.5">
                <DropdownMenuItem
                  className="gap-2 py-2"
                  nativeButton={false}
                  render={<Link href={APP_PROFILE_PATH} />}
                >
                  <UserPen className="size-4" />
                  Edit profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 py-2"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  <CircleHelp className="size-4" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 py-2"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  <ScrollText className="size-4" />
                  Legal
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="my-2" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2 py-2"
                  onClick={logout}
                >
                  <LogOut className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
