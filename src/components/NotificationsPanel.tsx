import { Link } from "@tanstack/react-router";
import { Bell, CheckCheck, Handshake, MessageSquare, Sparkles, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { fetchNotifications, markAllRead, markRead } from "@/store/notificationsSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import type { Notification } from "@/types";

const ICONS = {
  match: Sparkles,
  claim: Handshake,
  message: MessageSquare,
  status: RefreshCw,
} as const;

export function NotificationRow({ notification }: { notification: Notification }) {
  const dispatch = useAppDispatch();
  const Icon = ICONS[notification.type];
  return (
    <button
      type="button"
      onClick={() => dispatch(markRead(notification._id))}
      className={cn(
        "flex w-full gap-3 rounded-lg p-3 text-left transition-colors hover:bg-surface",
        !notification.read && "bg-primary/5",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
          notification.read ? "bg-surface text-muted-foreground" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{notification.title}</span>
          {!notification.read ? <span className="size-1.5 shrink-0 rounded-full bg-accent" /> : null}
        </span>
        <span className="mt-0.5 block text-xs text-muted-foreground">{notification.body}</span>
        <span className="mt-1 block text-[0.7rem] text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </span>
      </span>
    </button>
  );
}

export function NotificationsBell() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.notifications);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (status === "idle") void dispatch(fetchNotifications());
  }, [status, dispatch]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4.5" />
          {unread > 0 ? (
            <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-accent-foreground">
              {unread}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => dispatch(markAllRead())}
          >
            <CheckCheck className="size-3.5" /> Mark all read
          </Button>
        </div>
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {status === "loading" ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              You're all caught up.
            </p>
          ) : (
            items.slice(0, 5).map((n) => <NotificationRow key={n._id} notification={n} />)
          )}
        </div>
        <div className="border-t border-border pt-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function NotificationsList() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.notifications);

  useEffect(() => {
    if (status === "idle") void dispatch(fetchNotifications());
  }, [status, dispatch]);

  if (status === "loading") {
    return (
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications yet"
        description="Updates about matches, claims and moderation decisions will appear here."
      />
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {items.map((n) => (
        <NotificationRow key={n._id} notification={n} />
      ))}
    </div>
  );
}
