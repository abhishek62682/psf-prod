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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, MoreHorizontal, Plus, ImageOff } from "lucide-react";
import {
  adminListCampaigns,
  deleteCampaign,
  updateCampaign,
} from "@/config/api/campaign.api";
import type { CampaignWithDonationStats } from "@/config/api/campaign.api";
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_STYLES,
  CAMPAIGN_ADMIN_VIEW_LABELS,
  CAMPAIGN_ADMIN_VIEW_STYLES,
} from "@/config/campaignConstants";
import type { CampaignAdminView } from "@/config/campaignConstants";
import { getAssetUrl } from "@/Utils/constant";
import { formatIndianCurrencyShort } from "@/lib/utils";

const TAB_ORDER: CampaignAdminView[] = ["all", "active", "draft", "paused", "completed", "deleted"];

const CampaignsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [view, setView] = useState<CampaignAdminView>("active");
  const [deleteTarget, setDeleteTarget] = useState<CampaignWithDonationStats | null>(null);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-campaigns", page, view],
    queryFn: () => adminListCampaigns({ page, limit, status: view }),
  });

  const changeView = (next: string) => {
    setView(next as CampaignAdminView);
    setPage(1);
  };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: (typeof CAMPAIGN_STATUSES)[number] }) =>
      updateCampaign(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Status updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update status", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setDeleteTarget(null);
      toast.success("Campaign deleted");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to delete campaign", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const campaigns = data?.campaigns ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Campaigns</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Manage fundraising campaigns.</p>
        </div>
        <Button variant="theme" onClick={() => navigate("/dashboard/campaigns/create")}>
          <Plus className="h-4 w-4 mr-1" /> New Campaign
        </Button>
      </div>

      <Tabs value={view} onValueChange={changeView} className="mt-6">
        <TabsList>
          {TAB_ORDER.map((v) => (
            <TabsTrigger key={v} value={v} className="text-xs">
              {CAMPAIGN_ADMIN_VIEW_LABELS[v]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-600 w-16">Cover</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Title</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Raised / Goal</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Donations</TableHead>
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
                  Couldn't load campaigns. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-400">
                  {view === "active" ? "No campaigns yet. Create your first one." : "No campaigns in this view."}
                </TableCell>
              </TableRow>
            )}
            {campaigns.map((c) => (
              <TableRow key={c._id} className="hover:bg-slate-50 border-b border-slate-100">
                <TableCell className="py-3">
                  {c.coverImage ? (
                    <img
                      src={getAssetUrl(c.coverImage)}
                      alt={c.title}
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                      <ImageOff className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3 max-w-[220px]">
                  <p className="text-sm text-slate-700 truncate">{c.title}</p>
                  <p className="text-xs text-slate-400 truncate">{c.slug}</p>
                </TableCell>
                <TableCell className="py-3">
                  {view === "deleted" ? (
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_ADMIN_VIEW_STYLES.deleted}`}
                    >
                      Deleted
                    </span>
                  ) : (
                    <Select
                      value={c.status}
                      onValueChange={(status) =>
                        statusMutation.mutate({ id: c._id, status: status as (typeof CAMPAIGN_STATUSES)[number] })
                      }
                    >
                      <SelectTrigger
                        className={`h-7 text-xs w-[120px] border ${CAMPAIGN_STATUS_STYLES[c.status]}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAMPAIGN_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {CAMPAIGN_STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{formatIndianCurrencyShort(c.raisedAmount)}</p>
                  <p className="text-xs text-slate-400">of {formatIndianCurrencyShort(c.goalAmount)}</p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{c.meta.totalDonations} total</p>
                  <p className="text-xs text-slate-400">
                    <span className={c.meta.pendingDonations > 0 ? "text-red-600 font-medium" : undefined}>
                      {c.meta.pendingDonations} pending
                    </span>
                    {" · "}
                    {c.meta.verifiedDonations} verified · {c.meta.rejectedDonations} rejected
                  </p>
                </TableCell>
                <TableCell className="py-3 text-right">
                  {view === "deleted" ? (
                    <span className="text-xs text-slate-400">Archived</span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs font-semibold">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/campaigns/${c._id}`)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/campaigns/${c._id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/campaigns/${c._id}/donations`)}>
                          View Donations
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onSelect={(e) => {
                            e.preventDefault();
                            setDeleteTarget(c);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} campaigns
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              If this campaign has no donations on record, it's permanently deleted along with its images.
              Otherwise it's soft-deleted — hidden from public listings, but the record and donation history
              are kept. This action can't be undone from the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignsPage;
