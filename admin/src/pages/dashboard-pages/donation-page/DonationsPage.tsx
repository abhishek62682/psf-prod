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
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { adminListDonations } from "@/config/api/donation.api";
import {
  DONATION_STATUSES,
  DONATION_STATUS_LABELS,
  DONATION_STATUS_STYLES,
} from "@/config/donationConstants";
import type { DonationStatus } from "@/config/donationConstants";
import { formatIndianCurrencyShort } from "@/lib/utils";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const StatusBadge = ({ status }: { status: DonationStatus }) => (
  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${DONATION_STATUS_STYLES[status]}`}>
    {DONATION_STATUS_LABELS[status]}
  </span>
);

const DonationsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DonationStatus | "all">("pending");
  const [is80G, setIs80G] = useState<"all" | "true" | "false">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 20;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-donations", page, status, search, is80G],
    queryFn: () =>
      adminListDonations({
        page,
        limit,
        ...(status !== "all" && { status }),
        ...(search && { search }),
        ...(is80G !== "all" && { is80GApplicable: is80G === "true" }),
      }),
  });

  const donations = data?.donations ?? [];
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
            <BreadcrumbPage>Donations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <h1 className="text-xl font-bold">Donations</h1>
        <p className="text-sm text-muted-foreground">Verify or reject donor submissions.</p>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <Input
            placeholder="Search by name, email, or transaction ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit" variant="outline">Search</Button>
        </form>

        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as DonationStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {DONATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {DONATION_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={is80G}
          onValueChange={(v) => {
            setIs80G(v as "all" | "true" | "false");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="80G" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All (80G)</SelectItem>
            <SelectItem value="true">80G Claimed</SelectItem>
            <SelectItem value="false">80G Not Claimed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-600">Donor</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Campaign</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Transaction ID</TableHead>
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
                  Couldn't load donations. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-400">
                  No donations found for this filter.
                </TableCell>
              </TableRow>
            )}
            {donations.map((d) => {
              const campaign = typeof d.campaignId === "object" ? d.campaignId : null;
              return (
                <TableRow key={d._id} className="hover:bg-slate-50 border-b border-slate-100">
                  <TableCell className="py-3">
                    <p className="text-sm text-slate-700">{d.name}</p>
                    <p className="text-xs text-slate-400">{d.email}</p>
                  </TableCell>
                  <TableCell className="py-3 text-sm text-slate-600">{campaign?.title ?? "—"}</TableCell>
                  <TableCell className="py-3 text-sm text-slate-700">{formatIndianCurrencyShort(d.amount)}</TableCell>
                  <TableCell className="py-3 text-xs text-slate-500 font-mono">
                    {d.transactionId}
                    {d.is80GApplicable && (
                      <span className="ml-2 inline-flex items-center rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                        80G
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="py-3"><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="py-3 text-sm text-slate-600 whitespace-nowrap">{formatDate(d.createdAt)}</TableCell>
                  <TableCell className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/dashboard/donations/${d._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} donations
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
    </div>
  );
};

export default DonationsPage;
