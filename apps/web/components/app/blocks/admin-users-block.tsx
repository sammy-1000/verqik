"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Search, ShieldCheck, UserPlus } from "lucide-react";
import { FormField } from "@/components/forms/form-field";
import { UserDisplay } from "@/components/user/user-display";
import { ListingSkeleton } from "@/components/app/listing-toolbar";
import type { AppBlock } from "@/lib/app/types";
import { VERIFICATION_STATUS_LABELS, VerificationStatus } from "@/lib/enums";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { AdminUserCreateResult, AdminUserRecord } from "@/lib/ws/types";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";

const emptyForm = () => ({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
});

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  if (role === "admin") return "default";
  return "secondary";
}

export function AdminUsersBlock({ block }: { block: AppBlock }) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await wsClient.rpc<AdminUserRecord[]>(WsEvents.ADMIN_USERS_LIST, {
        q: query.trim() || undefined,
      });
      setUsers(items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setForm(emptyForm());
    setCreateOpen(true);
  }

  async function submitCreate() {
    if (!form.email.trim() || !form.password || !form.firstName.trim() || !form.lastName.trim()) {
      toast.error("Fill in all fields");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setCreating(true);
    try {
      const result = await wsClient.rpc<AdminUserCreateResult>(
        WsEvents.ADMIN_USERS_CREATE,
        {
          email: form.email.trim().toLowerCase(),
          password: form.password,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
        },
      );

      if (result.promoted) {
        toast.success(`Admin access granted to ${result.email}`);
      } else {
        toast.success(`Admin user created: ${result.email}`);
      }

      setCreateOpen(false);
      setForm(emptyForm());
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create admin");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle>{block.title}</CardTitle>
            <CardDescription>{block.description}</CardDescription>
          </div>
          <Button className="gap-2 shrink-0" onClick={openCreate}>
            <UserPlus className="size-4" />
            Add admin
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(searchInput);
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name or email"
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          {loading ? (
            <ListingSkeleton count={5} viewMode="list" />
          ) : users.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
              No users found.
            </p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => {
                const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();
                const verificationStatus =
                  user.verificationStatus as VerificationStatus;
                const isAdmin = user.roles.includes("admin");

                return (
                  <div
                    key={user.id}
                    className="border-border flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <UserDisplay
                          user={{
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            verification: { status: user.verificationStatus },
                          }}
                          showName
                          showEmail
                          showVerification
                          size="sm"
                        />
                        <p className="text-muted-foreground mt-1 text-xs">
                          Joined {new Date(user.createdAt).toLocaleDateString()} ·{" "}
                          {user.profileType.toLowerCase()}
                          {!user.isActive ? " · inactive" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isAdmin ? (
                        <Badge className="gap-1">
                          <ShieldCheck className="size-3" />
                          Admin
                        </Badge>
                      ) : null}
                      {user.roles
                        .filter((role) => role !== "admin")
                        .map((role) => (
                          <Badge key={role} variant={roleBadgeVariant(role)}>
                            {role}
                          </Badge>
                        ))}
                      <Badge variant="outline">
                        {VERIFICATION_STATUS_LABELS[verificationStatus] ??
                          user.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="border-border space-y-2 border-b px-6 py-5 text-left">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              Add admin user
            </DialogTitle>
            <DialogDescription>
              Create a new platform admin or promote an existing account with admin
              access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <FormField label="Email" htmlFor="admin-email" required>
              <Input
                id="admin-email"
                type="email"
                autoComplete="off"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@company.com"
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" htmlFor="admin-first-name" required>
                <Input
                  id="admin-first-name"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Last name" htmlFor="admin-last-name" required>
                <Input
                  id="admin-last-name"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </FormField>
            </div>
            <FormField
              label="Password"
              htmlFor="admin-password"
              required
              hint="Minimum 8 characters. Used for new accounts or to reset an existing user's password when promoting."
            >
              <Input
                id="admin-password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </FormField>
          </div>

          <DialogFooter className="border-border border-t px-6 py-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={() => void submitCreate()} disabled={creating}>
              <ShieldCheck className="size-4" />
              {creating ? "Saving…" : "Create admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
