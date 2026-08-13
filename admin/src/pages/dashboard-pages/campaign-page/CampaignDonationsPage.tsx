import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle, ArrowLeft, Clock, CheckCircle2, XCircle, ListChecks } from "lucide-react";
import { getCampaignById } from "@/config/api/campaign.api";
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

// Dedicated page for "how many donations does this one campaign have, and
// what's their status" — deliberately a separate page from the main
// Donations tab (which manages donations across every campaign at once).
const CampaignDonationsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DonationStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const limit = 20;

  const { data: campaign, isLoading: campaignLoading, isError: campaignError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: !!id,
  });

  // One request gets both the paginated/filtered list AND the campaign's
  // full status breakdown (data.stats) — the backend computes stats
  // independent of the status/search filters below, so we don't need
  // separate count-only requests per status.
  const { data, isLoading, isError } = useQuery({
    queryKey: ["campaign-donations-admin", id, page, status, search],
    queryFn: () =>
      adminListDonations({
        campaignId: id!,
        page,
        limit,
        ...(status !== "all" && { status }),
        ...(search && { search }),
      }),
    enabled: !!id,
  });

  const donations = data?.donations ?? [];
  const pagination = data?.pagination;
  const counts = data?.stats ?? { pending: 0, verified: 0, rejected: 0, total: 0 };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  if (campaignLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
        <LoaderCircle className="animate-spin h-4 w-4" /> Loading campaign...
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <p className="py-24 text-center text-sm text-red-500">
        Couldn't load this campaign. It may have been deleted.
      </p>
    );
  }

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/campaigns">Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/campaigns/${campaign._id}`}>{campaign.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Donations</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/campaigns/${campaign._id}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaign
        </Button>
        <h1 className="mt-2 text-xl font-bold">Donations — {campaign.title}</h1>
        <p className="text-sm text-muted-foreground">All donation submissions for this campaign, any status.</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{counts.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Verified</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{counts.verified}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{counts.rejected}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total</CardTitle>
            <ListChecks className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-800">{counts.total}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
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
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-600">Donor</TableHead>
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
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  <LoaderCircle className="animate-spin h-4 w-4 inline mr-2" /> Loading...
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-red-500">
                  Couldn't load donations. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && donations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">
                  No donations found for this filter.
                </TableCell>
              </TableRow>
            )}
            {donations.map((d) => (
              <TableRow key={d._id} className="hover:bg-slate-50 border-b border-slate-100">
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{d.name}</p>
                  <p className="text-xs text-slate-400">{d.email}</p>
                </TableCell>
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
            ))}
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

export default CampaignDonationsPage;
