"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";

// Import actions for CRUD
import {
  createPartyAction,
  updatePartyAction,
  archivePartyAction,
} from "./actions";

type Party = {
  id: string;
  name: string;
  role: string;
  contactEmail: string | null;
  phone: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
};

type ClientProps = {
  status: "success" | "error" | null;
  message: string | null;
  canManage: boolean;
  parties: Party[];
};

function formatTimestamp(iso: string | null) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PartiesClient({
  status,
  message,
  canManage,
  parties,
}: ClientProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Parties / Contacts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            List and manage all contract parties and contacts for your organization.
          </p>
        </header>
        {canManage ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Party</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Party / Contact</DialogTitle>
                <DialogDescription>
                  Enter party or contact information for use in new contracts.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-3" action={createPartyAction}>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input name="name" required maxLength={80} />
                </div>
                <div>
                  <label className="text-sm font-medium">Role (e.g. Client, Supplier, etc.)</label>
                  <Input name="role" required maxLength={80} />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input name="contactEmail" type="email" maxLength={120} />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input name="phone" maxLength={30} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create Party</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {status && message ? (
        <p
          className={`rounded-md border px-3 py-2 text-sm ${
            status === "success"
              ? "border-emerald-500/30 text-emerald-600"
              : "border-destructive/30 text-destructive"
          }`}
        >
          {message}
        </p>
      ) : null}

      {!canManage ? (
        <p className="text-sm text-muted-foreground">
          You have read-only access. Only admins and owners can add, edit, or archive parties.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parties List</CardTitle>
          <CardDescription>Name, role, and contact info for all parties.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No parties found. Use Add Party to create your first.
                  </TableCell>
                </TableRow>
              ) : (
                parties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.role}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.contactEmail || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.phone || "-"}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatTimestamp(p.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!canManage}>
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Party</DialogTitle>
                              <DialogDescription>
                                Update party information.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="space-y-3" action={updatePartyAction}>
                              <input type="hidden" name="id" value={p.id} />
                              <div>
                                <label className="text-sm font-medium">Name</label>
                                <Input name="name" defaultValue={p.name} required maxLength={80} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Role</label>
                                <Input name="role" defaultValue={p.role} required maxLength={80} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <Input name="contactEmail" type="email" defaultValue={p.contactEmail || ""} maxLength={120} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <Input name="phone" defaultValue={p.phone || ""} maxLength={30} />
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="outline">
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <Button type="submit">Save Changes</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <form action={archivePartyAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            disabled={!canManage}
                          >
                            <Trash2 className="mr-1 size-4" />
                            Archive
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}