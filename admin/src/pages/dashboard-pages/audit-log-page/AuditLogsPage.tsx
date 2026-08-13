import { useState } from "react";
import type { FormEvent } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
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
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import {
  listPaymentReceivingAuditLogs,
} from "@/config/api/paymentReceiving.api";
import type { PaymentReceivingAuditLog } from "@/config/api/paymentReceiving.api";

const ACTION_LABELS: Record<PaymentReceivingAuditLog["action"], string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  qr_code_removed: "QR Code Removed",
};

const ACTION_STYLES: Record<PaymentReceivingAuditLog["action"], string> = {
  created: "bg-green-50 text-green-700 border-green-200",
  updated: "bg-blue-50 text-blue-700 border-blue-200",
  deleted: "bg-red-50 text-red-700 border-red-200",
  qr_code_removed: "bg-amber-50 text-amber-700 border-amber-200",
};

const formatDateTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const formatValue = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
};

const summarizeChanges = (log: PaymentReceivingAuditLog): string => {
  if (log.changes.length === 0) return "—";
  return log.changes.map((c) => c.field).join(", ");
};

// Minimal User-Agent parse — avoids pulling in a UA-parsing dependency.
const parseDevice = (userAgent: string | null): string => {
  if (!userAgent) return "—";

  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac OS X") && !userAgent.includes("iPhone") && !userAgent.includes("iPad")
    ? "macOS"
    : userAgent.includes("iPhone")
    ? "iPhone"
    : userAgent.includes("iPad")
    ? "iPad"
    : userAgent.includes("Android")
    ? "Android"
    : userAgent.includes("Linux")
    ? "Linux"
    : null;

  const browser = userAgent.includes("Edg/")
    ? "Edge"
    : userAgent.includes("Chrome/")
    ? "Chrome"
    : userAgent.includes("Firefox/")
    ? "Firefox"
    : userAgent.includes("Safari/") && !userAgent.includes("Chrome/")
    ? "Safari"
    : null;

  if (browser && os) return `${browser} on ${os}`;
  if (browser) return browser;
  if (os) return os;
  return userAgent.length > 40 ? `${userAgent.slice(0, 40)}…` : userAgent;
};

const AuditLogsPage = () => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<PaymentReceivingAuditLog["action"] | "all">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [viewTarget, setViewTarget] = useState<PaymentReceivingAuditLog | null>(null);
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payment-receiving-audit-logs", page, action, search],
    queryFn: () =>
      listPaymentReceivingAuditLogs({
        page,
        limit,
        ...(action !== "all" && { action }),
        ...(search && { search }),
      }),
  });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Audit Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="text-xl font-bold">Audit Logs</h1>
        <p className="text-sm text-muted-foreground">
          Every change made to payment receiving configuration — who changed it, what changed, and when.
        </p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by admin name or email"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>

        <Select
          value={action}
          onValueChange={(v) => {
            setAction(v as PaymentReceivingAuditLog["action"] | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {(Object.keys(ACTION_LABELS) as PaymentReceivingAuditLog["action"][]).map((a) => (
              <SelectItem key={a} value={a}>
                {ACTION_LABELS[a]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-600">When</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Action</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Account Name</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Changed By</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">IP Address</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Device</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Fields Changed</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600 text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-500">
                  <LoaderCircle className="animate-spin h-4 w-4 inline mr-2" /> Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-red-500">
                  Couldn't load audit logs. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-sm text-slate-400">
                  No audit log entries found for this filter.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log) => (
              <TableRow key={log._id} className="hover:bg-slate-50 border-b border-slate-100">
                <TableCell className="py-3 text-sm text-slate-600 whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </TableCell>
                <TableCell className="py-3">
                  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${ACTION_STYLES[log.action]}`}>
                    {ACTION_LABELS[log.action]}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-700">
                  {log.accountId?.accountName ?? "—"}
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{log.changedBy?.name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{log.changedBy?.email ?? ""}</p>
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-600 whitespace-nowrap font-mono text-xs">
                  {log.ipAddress ?? "—"}
                </TableCell>
                <TableCell className="py-3 text-sm text-slate-600 whitespace-nowrap">
                  {parseDevice(log.userAgent)}
                </TableCell>
                <TableCell className="py-3 max-w-[260px]">
                  <p className="text-sm text-slate-600 truncate">{summarizeChanges(log)}</p>
                </TableCell>
                <TableCell className="py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => setViewTarget(log)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} entries
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

      <Sheet open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <SheetContent>
          {viewTarget && (
            <>
              <SheetHeader>
                <SheetTitle>{ACTION_LABELS[viewTarget.action]}</SheetTitle>
                <SheetDescription>
                  {viewTarget.accountId?.accountName ?? "Payment receiving account"} ·{" "}
                  {formatDateTime(viewTarget.createdAt)}
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 pb-4 space-y-4 overflow-y-auto text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Changed By</p>
                  <p className="text-slate-700">{viewTarget.changedBy?.name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{viewTarget.changedBy?.email ?? ""}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">IP Address</p>
                    <p className="text-slate-700 font-mono text-xs">{viewTarget.ipAddress ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Device</p>
                    <p className="text-slate-700">{parseDevice(viewTarget.userAgent)}</p>
                  </div>
                </div>
                {viewTarget.userAgent && (
                  <div>
                    <p className="text-muted-foreground text-xs">Full User Agent</p>
                    <p className="text-slate-500 text-xs break-all">{viewTarget.userAgent}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground text-xs mb-2">Changes</p>
                  {viewTarget.changes.length === 0 ? (
                    <p className="text-slate-400 text-sm">No field-level changes recorded.</p>
                  ) : (
                    <div className="space-y-2">
                      {viewTarget.changes.map((c) => (
                        <div key={c.field} className="rounded-md border border-slate-200 px-3 py-2">
                          <p className="text-xs font-semibold text-slate-600 mb-1">{c.field}</p>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-red-600 line-through">{formatValue(c.oldValue)}</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-green-700 font-medium">{formatValue(c.newValue)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AuditLogsPage;
