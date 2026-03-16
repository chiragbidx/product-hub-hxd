"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
// Import server actions here when ready to wire forms

type Contract = {
  id: string;
  name: string;
  status: string;
  effectiveDate: string | null;
  updatedAt: string | null;
  archivedAt: string | null;
  templateId: string | null;
};

type Template = {
  id: string;
  name: string;
};
type Party = {
  id: string;
  name: string;
  role: string;
};

type ClientProps = {
  status: "success" | "error" | null;
  message: string | null;
  canManage: boolean;
  contracts: Contract[];
  templates: Template[];
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

export default function ContractsClient({
  status,
  message,
  canManage,
  contracts,
  templates,
  parties,
}: ClientProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Contracts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your agreements—create, edit, archive, and search securely with DocuBuild.
          </p>
        </header>
        {canManage ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>Add Contract</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contract</DialogTitle>
                <DialogDescription>
                  Start a new contract (either from a blank or from a template).
                </DialogDescription>
              </DialogHeader>
              {/* TODO: Wire up createContractAction and Form fields 
                - Name
                - Template (select, optional)
                - Effective Date
                - Assign parties (multi-select or comma, initially text for simplicity)
                - Status (dropdown: draft/pending/signed/archived)
                - Main contract content/textarea (for custom or final after template merge)
              */}
              <form className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Contract Name</label>
                  <Input name="name" required maxLength={80} />
                </div>
                <div>
                  <label className="text-sm font-medium">Template</label>
                  <select name="templateId" className="w-full rounded border px-3 py-2 text-sm">
                    <option value="">None</option>
                    {templates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Effective Date</label>
                  <Input name="effectiveDate" type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select name="status" className="w-full rounded border px-3 py-2 text-sm">
                    <option value="draft">Draft</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="signed">Signed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assign Parties</label>
                  {/* For now free text, later multi-select with parties data */}
                  <Input name="parties" placeholder="Comma-separated party names" />
                </div>
                <div>
                  <label className="text-sm font-medium">Content</label>
                  <Textarea name="content" rows={5} maxLength={4000} />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Create Contract</Button>
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
          You have read-only access. Only admins and owners can add, edit, or archive contracts.
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contracts List</CardTitle>
          <CardDescription>View and manage all contracts for your team.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Effective Date</TableHead>
                <TableHead className="hidden md:table-cell">Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No contracts yet. Use Add Contract to get started.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">{contract.name}</TableCell>
                    <TableCell>
                      <Badge variant={contract.status === "signed" ? "default" : "secondary"}>
                        {contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{formatTimestamp(contract.effectiveDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatTimestamp(contract.updatedAt)}
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
                              <DialogTitle>Edit Contract</DialogTitle>
                              <DialogDescription>
                                Edit contract information and content.
                              </DialogDescription>
                            </DialogHeader>
                            <form className="space-y-3">
                              {/* TODO: Wire updateContractAction with correct fields */}
                              <input type="hidden" name="id" value={contract.id} />
                              <div>
                                <label className="text-sm font-medium">Contract Name</label>
                                <Input name="name" defaultValue={contract.name} required maxLength={80} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Status</label>
                                <select name="status" defaultValue={contract.status} className="w-full rounded border px-3 py-2 text-sm">
                                  <option value="draft">Draft</option>
                                  <option value="pending_review">Pending Review</option>
                                  <option value="signed">Signed</option>
                                  <option value="archived">Archived</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Effective Date</label>
                                <Input name="effectiveDate" type="date" defaultValue={contract.effectiveDate?.slice(0,10)} />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Content</label>
                                <Textarea name="content" defaultValue={""} rows={5} maxLength={4000} />
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
                          {/* TODO: Wire delete/archive contract action */}
                          <input type="hidden" name="id" value={contract.id} />
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