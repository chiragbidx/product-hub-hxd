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

type Template = {
  id: string;
  name: string;
  content: string;
  updatedAt: string | null;
  archivedAt: string | null;
};

type ClientProps = {
  status: "success" | "error" | null;
  message: string | null;
  canManage: boolean;
  templates: Template[];
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

export default function TemplatesClient({
  status,
  message,
  canManage,
  templates,
}: ClientProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Contract Templates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Save reusable contract language and generate new agreements from these templates.
          </p>
        </header>
        {canManage ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Template</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contract Template</DialogTitle>
                <DialogDescription>
                  Define your template content. Use <code>{"{{field_name}}"}</code> for dynamic fields.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input name="name" required maxLength={80} />
                </div>
                <div>
                  <label className="text-sm font-medium">Template Content</label>
                  <Textarea name="content" rows={8} maxLength={8000} placeholder="e.g. THIS AGREEMENT is entered into as of {{effective_date}} between {{party_a}} and {{party_b}}..."/>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use <code>{"{{your_field}}"}</code> to add placeholders.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create Template</Button>
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
          You have read-only access. Only admins and owners can add, edit, or archive templates.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates List</CardTitle>
          <CardDescription>View available templates for your organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No templates found. Use Add Template to create your first.
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tpl) => (
                  <TableRow key={tpl.id}>
                    <TableCell className="font-medium">{tpl.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatTimestamp(tpl.updatedAt)}
                    </TableCell>
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
                              <DialogTitle>Edit Template</DialogTitle>
                              <DialogDescription>
                                Update template name or content.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="space-y-3">
                              <input type="hidden" name="id" value={tpl.id} />
                              <div>
                                <label className="text-sm font-medium">Template Name</label>
                                <Input name="name" defaultValue={tpl.name} required maxLength={80} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Template Content</label>
                                <Textarea name="content" defaultValue={tpl.content} rows={8} maxLength={8000} />
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
                        <form>
                          {/* TODO: Wire soft delete/archive template */}
                          <input type="hidden" name="id" value={tpl.id} />
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