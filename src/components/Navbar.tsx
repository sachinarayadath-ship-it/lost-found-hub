import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, PlusCircle, Search, ShieldCheck, User as UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { NotificationsBell } from "@/components/NotificationsPanel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { hydrate, logout } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse items" },
  { to: "/report", label: "Report an item" },
] as const;

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { user, hydrated } = useAppSelector((s) => s.auth);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!hydrated) dispatch(hydrate());
  }, [hydrated, dispatch]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate({ to: "/", replace: true });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background">
      <div className="container-page flex h-16 items-center gap-3">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Search className="size-4.5" />
          </span>
          <span className="font-display truncate text-lg font-bold tracking-tight">
            LostFound<span className="text-accent">+</span>
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground",
              )}
              activeProps={{ className: "bg-surface text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <NotificationsBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {user.name.charAt(0)}
                    </span>
                    <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="size-4" /> My dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserIcon className="size-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <ShieldCheck className="size-4" /> Admin console
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Create account</Link>
              </Button>
            </div>
          )}

          <Button size="sm" className="hidden lg:inline-flex" variant="accent" asChild>
            <Link to="/report">
              <PlusCircle className="size-4" /> Report
            </Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-4">Menu</SheetTitle>
              <nav className="flex flex-col gap-1 p-4">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface"
                    >
                      My dashboard
                    </Link>
                    <Link
                      to="/notifications"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface"
                    >
                      Notifications
                    </Link>
                    <Link
                      to="/profile"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface"
                    >
                      Profile
                    </Link>
                    {user.role === "admin" ? (
                      <Link
                        to="/admin"
                        className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface"
                      >
                        Admin console
                      </Link>
                    ) : null}
                    <Button variant="outline" className="mt-3" onClick={handleLogout}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <div className="mt-3 grid gap-2">
                    <Button asChild>
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/register">Create account</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface/60">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <p className="font-display text-lg font-bold">
            LostFound<span className="text-accent">+</span>
          </p>
          <p className="text-sm text-muted-foreground">
            A community-run desk for reporting, matching and recovering lost belongings.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Platform</p>
          <Link to="/browse" className="block text-muted-foreground hover:text-foreground">
            Browse items
          </Link>
          <Link to="/report" className="block text-muted-foreground hover:text-foreground">
            Report an item
          </Link>
          <Link to="/dashboard" className="block text-muted-foreground hover:text-foreground">
            My dashboard
          </Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Account</p>
          <Link to="/login" className="block text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
          <Link to="/register" className="block text-muted-foreground hover:text-foreground">
            Create account
          </Link>
          <Link to="/profile" className="block text-muted-foreground hover:text-foreground">
            Profile
          </Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Safety</p>
          <p>
            Contact details are never shown publicly. All handovers are verified by a moderator
            before an item is released.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} LostFound+ Community Desk. All rights reserved.
      </div>
    </footer>
  );
}
