import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, Mail, Phone, Trash2, MoreHorizontal } from "lucide-react";
import {
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from "@/config/api/contact.api";
import type { ContactMessage } from "@/config/api/contact.api";
import {
  CONTACT_STATUSES,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_STYLES,
  CONTACT_INTEREST_LABELS,
} from "@/config/contactConstants";
import type { ContactStatus } from "@/config/contactConstants";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const formatDateTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const ContactMessagesPage = () => {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ContactStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [viewTarget, setViewTarget] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["contact-messages", page, status, search],
    queryFn: () =>
      listContactMessages({
        page,
        limit,
        ...(status !== "all" && { status }),
        ...(search && { search }),
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ContactStatus }) =>
      updateContactStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      toast.success("Status updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update status", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteContactMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      setDeleteTarget(null);
      toast.success("Message deleted");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to delete message", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const messages = data?.messages ?? [];
  const pagination = data?.pagination;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Messages</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="text-xl font-bold">Contact Messages</h1>
        <p className="text-sm text-muted-foreground">Messages submitted through the "Send Us a Message" form.</p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by name, email, or subject"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as ContactStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CONTACT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {CONTACT_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-600">From</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Mobile</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Subject</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Interested In</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Submitted</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  <LoaderCircle className="animate-spin h-4 w-4 inline mr-2" /> Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-red-500">
                  Couldn't load messages. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && messages.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-400">
                  No messages found for this filter.
                </TableCell>
              </TableRow>
            )}
            {messages.map((m) => (
              <TableRow key={m._id} className="hover:bg-slate-50 border-b border-slate-100">
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{m.fullName}</p>
                  <p className="text-xs text-slate-400">{m.email}</p>
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-600 whitespace-nowrap">
                  {m.phone || "—"}
                </TableCell>
                <TableCell className="py-3 max-w-[240px]">
                  <p className="text-sm text-slate-600 truncate">{m.subject}</p>
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-600">
                  {m.interest ? CONTACT_INTEREST_LABELS[m.interest] : "—"}
                </TableCell>
                <TableCell className="py-3">
                  <Select
                    value={m.status}
                    onValueChange={(v) => statusMutation.mutate({ id: m._id, status: v as ContactStatus })}
                  >
                    <SelectTrigger
                      className={`h-7 text-xs w-[130px] border ${CONTACT_STATUS_STYLES[m.status]}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {CONTACT_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(m.createdAt)}</TableCell>
                <TableCell className="py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuLabel className="text-xs font-semibold">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setViewTarget(m)}>View</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onSelect={(e) => {
                          e.preventDefault();
                          setDeleteTarget(m);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} messages
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* View sidebar — read-only. Status is changed from the dropdown in
          the table row above, not from here. */}
      <Sheet open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <SheetContent>
          {viewTarget && (
            <>
              <SheetHeader>
                <SheetTitle>{viewTarget.fullName}</SheetTitle>
                <SheetDescription>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${CONTACT_STATUS_STYLES[viewTarget.status]}`}>
                    {CONTACT_STATUS_LABELS[viewTarget.status]}
                  </span>
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-4 space-y-4 overflow-y-auto text-sm">
                <div className="space-y-1.5">
                  <a href={`mailto:${viewTarget.email}`} className="text-blue-600 hover:underline inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> {viewTarget.email}
                  </a>
                  {viewTarget.phone && (
                    <p className="text-slate-700 inline-flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {viewTarget.phone}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-muted-foreground text-xs">Interested In</p>
                  <p className="text-slate-700">
                    {viewTarget.interest ? CONTACT_INTEREST_LABELS[viewTarget.interest] : "—"}
                  </p>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs">Subject</p>
                  <p className="text-slate-700">{viewTarget.subject}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs">Message</p>
                  <p className="text-slate-700 whitespace-pre-wrap">{viewTarget.message}</p>
                </div>

                <div>
                  <p className="text-muted-foreground text-xs">Submitted</p>
                  <p className="text-slate-700">{formatDateTime(viewTarget.createdAt)}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the message from {deleteTarget?.fullName}. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <LoaderCircle className="animate-spin mr-1.5 h-3.5 w-3.5" /> Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContactMessagesPage;
