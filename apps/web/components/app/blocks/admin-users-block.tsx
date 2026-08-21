"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { FormField } from "@/components/forms/form-field";
import { ProfileTypeSelect } from "@/components/forms/profile-type-select";
import { UserDisplay } from "@/components/user/user-display";
import { ListingPagination, ListingSkeleton } from "@/components/app/listing-toolbar";
import type { AppBlock } from "@/lib/app/types";
import { UserProfileType } from "@/lib/enums";
import { wsClient } from "@/lib/ws/client";
import { WsEvents } from "@/lib/ws/events";
import type { AdminUserCreateResult, AdminUserListResult, AdminUserRecord } from "@/lib/ws/types";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";

type UserFormState = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileType: UserProfileType;
  grantAdmin: boolean;
  isActive: boolean;
};

const emptyCreateForm = (): UserFormState => ({
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  profileType: UserProfileType.SENDER,
  grantAdmin: false,
  isActive: true,
});

function userToEditForm(user: AdminUserRecord): UserFormState {
  return {
    email: user.email,
    password: "",
    firstName: user.firstName,
    lastName: user.lastName,
    profileType: user.profileType as UserProfileType,
    grantAdmin: user.roles.includes("admin"),
    isActive: user.isActive,
  };
}

function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  if (role === "admin") return "default";
  return "secondary";
}

function CheckboxField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="border-input mt-1 size-4 rounded border"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium">{label}</span>
        {description ? (
          <span className="text-muted-foreground block text-xs">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

const USERS_PAGE_SIZE = 10;

export function AdminUsersBlock({ block }: { block: AppBlock }) {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState(emptyCreateForm);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await wsClient.rpc<AdminUserListResult>(WsEvents.ADMIN_USERS_LIST, {
        q: query.trim() || undefined,
        page,
        pageSize: USERS_PAGE_SIZE,
      });
      setUsers(result.items);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPage(result.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setCreateForm(emptyCreateForm());
    setCreateOpen(true);
  }

  function openEdit(user: AdminUserRecord) {
    setSelectedUser(user);
    setEditForm(userToEditForm(user));
    setEditOpen(true);
  }

  function openDelete(user: AdminUserRecord) {
    setSelectedUser(user);
    setDeleteOpen(true);
  }

  async function submitCreate() {
    if (
      !createForm.email.trim() ||
      !createForm.password ||
      !createForm.firstName.trim() ||
      !createForm.lastName.trim()
    ) {
      toast.error("Fill in all required fields");
      return;
    }
    if (createForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      const result = await wsClient.rpc<AdminUserCreateResult>(
        WsEvents.ADMIN_USERS_CREATE,
        {
          email: createForm.email.trim().toLowerCase(),
          password: createForm.password,
          firstName: createForm.firstName.trim(),
          lastName: createForm.lastName.trim(),
          profileType: createForm.profileType,
          grantAdmin: createForm.grantAdmin,
        },
      );

      if (result.promoted) {
        toast.success(`Admin access granted to ${result.email}`);
      } else {
        toast.success(`User created: ${result.email}`);
      }

      setCreateOpen(false);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  async function submitEdit() {
    if (!selectedUser) return;
    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (editForm.password && editForm.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    try {
      await wsClient.rpc(WsEvents.ADMIN_USERS_UPDATE, {
        userId: selectedUser.id,
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        profileType: editForm.profileType,
        isActive: editForm.isActive,
        grantAdmin: editForm.grantAdmin,
        ...(editForm.password ? { password: editForm.password } : {}),
      });
      toast.success("User updated");
      setEditOpen(false);
      setSelectedUser(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!selectedUser) return;

    setSaving(true);
    try {
      await wsClient.rpc(WsEvents.ADMIN_USERS_DELETE, {
        userId: selectedUser.id,
      });
      toast.success(`Deleted ${selectedUser.email}`);
      setDeleteOpen(false);
      setSelectedUser(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">{block.title}</h2>
            <p className="text-muted-foreground text-sm">{block.description}</p>
          </div>
          <Button className="shrink-0 gap-2" onClick={openCreate}>
            <UserPlus className="size-4" />
            Add user
          </Button>
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
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

        <ListingPagination
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

        {loading ? (
          <ListingSkeleton count={5} viewMode="list" />
        ) : users.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            No users found.
          </p>
        ) : (
          users.map((user) => {
            const isAdmin = user.roles.includes("admin");

            return (
              <div
                key={user.id}
                className="border-border flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <UserDisplay
                    user={{
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                      profilePhotoUrl: user.profilePhotoUrl,
                      verification: { status: user.verificationStatus },
                    }}
                    showAvatar
                    showName
                    showEmail
                    showVerification
                    size="sm"
                  />
                  <p className="text-muted-foreground text-xs">
                    Joined {new Date(user.createdAt).toLocaleDateString()} ·{" "}
                    {user.profileType.toLowerCase()}
                    {!user.isActive ? " · inactive" : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => openEdit(user)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive gap-1.5"
                    onClick={() => openDelete(user)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </section>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="border-border space-y-2 border-b px-6 py-5 text-left">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              Add user
            </DialogTitle>
            <DialogDescription>
              Create a platform user or grant admin access to a new account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <FormField label="Email" htmlFor="create-email" required>
              <Input
                id="create-email"
                type="email"
                autoComplete="off"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" htmlFor="create-first-name" required>
                <Input
                  id="create-first-name"
                  value={createForm.firstName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Last name" htmlFor="create-last-name" required>
                <Input
                  id="create-last-name"
                  value={createForm.lastName}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </FormField>
            </div>
            <ProfileTypeSelect
              value={createForm.profileType}
              onValueChange={(profileType) =>
                setCreateForm((f) => ({ ...f, profileType }))
              }
            />
            <FormField label="Password" htmlFor="create-password" required>
              <Input
                id="create-password"
                type="password"
                autoComplete="new-password"
                value={createForm.password}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </FormField>
            <CheckboxField
              id="create-grant-admin"
              label="Grant admin access"
              description="Allows full platform management including this panel."
              checked={createForm.grantAdmin}
              onCheckedChange={(grantAdmin) =>
                setCreateForm((f) => ({ ...f, grantAdmin }))
              }
            />
          </div>

          <DialogFooter className="border-border border-t px-6 py-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="gap-2" onClick={() => void submitCreate()} disabled={saving}>
              {saving ? "Saving…" : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md gap-0 p-0">
          <DialogHeader className="border-border space-y-2 border-b px-6 py-5 text-left">
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="First name" htmlFor="edit-first-name" required>
                <Input
                  id="edit-first-name"
                  value={editForm.firstName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Last name" htmlFor="edit-last-name" required>
                <Input
                  id="edit-last-name"
                  value={editForm.lastName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </FormField>
            </div>
            <ProfileTypeSelect
              value={editForm.profileType}
              onValueChange={(profileType) =>
                setEditForm((f) => ({ ...f, profileType }))
              }
            />
            <FormField
              label="New password"
              htmlFor="edit-password"
              hint="Leave blank to keep the current password"
            >
              <Input
                id="edit-password"
                type="password"
                autoComplete="new-password"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </FormField>
            <CheckboxField
              id="edit-active"
              label="Account active"
              checked={editForm.isActive}
              onCheckedChange={(isActive) =>
                setEditForm((f) => ({ ...f, isActive }))
              }
            />
            <CheckboxField
              id="edit-grant-admin"
              label="Admin access"
              description="Grant or revoke platform admin role."
              checked={editForm.grantAdmin}
              onCheckedChange={(grantAdmin) =>
                setEditForm((f) => ({ ...f, grantAdmin }))
              }
            />
          </div>

          <DialogFooter className="border-border border-t px-6 py-4">
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={() => void submitEdit()} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Permanently delete{" "}
              <span className="text-foreground font-medium">
                {selectedUser?.firstName} {selectedUser?.lastName}
              </span>{" "}
              ({selectedUser?.email})? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={saving}>
              {saving ? "Deleting…" : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
