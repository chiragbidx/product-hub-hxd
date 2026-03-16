"use client";

import { useState, useRef } from "react";
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
import { Trash2, Sparkles } from "lucide-react";

import {
  createContractAction,
  updateContractAction,
  archiveContractAction,
  generateContractWithAIAction,
} from "./actions";

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
  // AI Generation states
  const [aiStatus, setAIStatus] = useState<null | "loading" | "success" | "error">(null);
  const [aiMessage, setAIMessage] = useState<string | null>(null);
  const [aiContent, setAIContent] = useState<string>("");
  const [aiGenForm, setAIGenForm] = useState({
    name: "",
    templateId: "",
    parties: "",
    description: "",
  });

  async function handleAIGenerateContractButton() {
    setAIStatus("loading");
    setAIMessage(null);

    const data = new FormData();
    data.set("name", aiGenForm.name);
    data.set("templateId", aiGenForm.templateId);
    data.set("parties", aiGenForm.parties);
    data.set("description", aiGenForm.description);

    const res = await generateContractWithAIAction(data);

    if (res.status === "success") {
      setAIContent(res.content || "");
      setAIStatus("success");
      setAIMessage(res.message);
    } else {
      setAIContent("");
      setAIStatus("error");
      setAIMessage(res.message);
    }
  }

  // Handler to copy main contract form values to the AI gen context
  function syncMainFormToAIFields(form: HTMLFormElement) {
    setAIGenForm({
      name: (form.elements.namedItem("name") as HTMLInputElement)?.value ?? "",
      templateId: (form.elements.namedItem("templateId") as HTMLSelectElement)?.value ?? "",
      parties: (form.elements.namedItem("parties") as HTMLInputElement)?.value ?? "",
      description: "", // must retype/prompt for AI
    });
  }

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
                  Start a new contract: blank, template, or draft with AI.
                  <br />
                  <span className="flex items-center text-xs gap-2 mt-2">
                    <Sparkles size={14} className="text-primary" />
                    AI draft generation is assistive only. Review and edit before submitting.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <ContractFormWithAI
                templates={templates}
                aiContent={aiContent}
                setAIContent={setAIContent}
                aiStatus={aiStatus}
                aiMessage={aiMessage}
                aiGenForm={aiGenForm}
                setAIGenForm={setAIGenForm}
                onAIButtonClick={handleAIGenerateContractButton}
                createContractAction={createContractAction}
                syncMainFormToAIFields={syncMainFormToAIFields}
              />
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
                            <form className="space-y-3" action={updateContractAction}>
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

                        <form action={archiveContractAction}>
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

// ContractFormWithAI, with AI fields as div and button (not a form)
function ContractFormWithAI({
  templates,
  aiContent,
  setAIContent,
  aiStatus,
  aiMessage,
  aiGenForm,
  setAIGenForm,
  onAIButtonClick,
  createContractAction,
  syncMainFormToAIFields,
}: {
  templates: Template[];
  aiContent: string;
  setAIContent: (s: string) => void;
  aiStatus: null | "loading" | "success" | "error";
  aiMessage: string | null;
  aiGenForm: { name: string; templateId: string; parties: string; description: string };
  setAIGenForm: (s: { name: string; templateId: string; parties: string; description: string }) => void;
  onAIButtonClick: () => void;
  createContractAction: any;
  syncMainFormToAIFields: (form: HTMLFormElement) => void;
}) {
  const contractFormRef = useRef<HTMLFormElement>(null);

  function handleMainFormChange() {
    if (contractFormRef.current) {
      syncMainFormToAIFields(contractFormRef.current);
    }
  }

  function handleAIInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setAIGenForm({ ...aiGenForm, description: e.target.value });
  }

  return (
    <>
      <form
        className="space-y-3"
        action={createContractAction}
        ref={contractFormRef}
        onChange={handleMainFormChange}
      >
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
          <Input name="parties" placeholder="Comma-separated party names" />
        </div>
        <div>
          <label className="text-sm font-medium flex items-center gap-2">
            Content
            <span className="text-xs text-muted-foreground">(You may generate with AI below!)</span>
          </label>
          <Textarea
            name="content"
            rows={5}
            maxLength={4000}
            value={aiContent}
            onChange={(e) => setAIContent(e.target.value)}
            placeholder="Paste your contract (or use AI to generate a draft below)"
          />
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold flex items-center gap-1">
              <Sparkles size={14} className="text-primary" />
              Generate contract content with AI
            </summary>
            <div className="space-y-2 mt-3 bg-muted/60 p-3 rounded">
              <div>
                <label className="text-xs font-medium">Contract Name (copied from above)</label>
                <Input
                  name="ai_name"
                  value={aiGenForm.name}
                  disabled
                  className="py-1 text-xs bg-muted"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Template for AI (optional, copied from above)</label>
                <select
                  name="ai_templateId"
                  className="w-full rounded border px-3 py-1 text-xs"
                  value={aiGenForm.templateId}
                  disabled
                >
                  <option value="">None</option>
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Assign Parties (optional, copied from above)</label>
                <Input
                  name="ai_parties"
                  value={aiGenForm.parties}
                  disabled
                  className="py-1 text-xs bg-muted"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Describe what this contract needs to accomplish</label>
                <Textarea
                  name="ai_description"
                  rows={2}
                  maxLength={300}
                  value={aiGenForm.description}
                  onChange={handleAIInputChange}
                  required
                />
              </div>
              <Button
                size="sm"
                type="button"
                onClick={onAIButtonClick}
                disabled={aiStatus === "loading" || !aiGenForm.description.trim()}
              >
                <Sparkles className="mr-1 size-4" />
                {aiStatus === "loading" ? "Generating..." : "Generate with AI"}
              </Button>
              {aiStatus === "error" && (
                <p className="text-xs text-destructive mt-1">{aiMessage}</p>
              )}
              {aiStatus === "success" && (
                <p className="text-xs text-emerald-700 mt-1">{aiMessage}</p>
              )}
            </div>
          </details>
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
    </>
  );
}