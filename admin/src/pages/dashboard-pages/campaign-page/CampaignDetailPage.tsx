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
import { Button } from "@/components/ui/button";
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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, ArrowLeft, Pencil, HandCoins, Trash2, ImageOff } from "lucide-react";
import { getCampaignById, deleteCampaign } from "@/config/api/campaign.api";
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_STYLES } from "@/config/campaignConstants";
import { getAssetUrl } from "@/Utils/constant";
import { formatCurrency } from "@/lib/utils";

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

const CampaignDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: campaign, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCampaign(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign deleted");
      navigate("/dashboard/campaigns");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to delete campaign", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
        <LoaderCircle className="animate-spin h-4 w-4" /> Loading campaign...
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <p className="py-24 text-center text-sm text-red-500">
        Couldn't load this campaign. It may have been deleted.
      </p>
    );
  }

  // campaign.progress is rounded to the nearest whole percent server-side,
  // so tiny-but-real progress (e.g. ₹2,600 of ₹20,00,000 = 0.13%) rounds
  // down to 0 — a 0%-wide bar with "0% funded" text looks broken even
  // though the raised amount above proves money came in. Compute the exact
  // ratio here so the bar width and the label always agree with each other
  // and with reality, instead of faking a minimum bar width that the label
  // would then contradict.
  const preciseProgress =
    campaign.goalAmount > 0
      ? Math.min(100, (campaign.raisedAmount / campaign.goalAmount) * 100)
      : 0;
  const progressLabel =
    preciseProgress > 0 && preciseProgress < 1 ? "<1%" : `${Math.round(preciseProgress)}%`;

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/campaigns">Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{campaign.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/campaigns")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Campaigns
        </Button>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_STYLES[campaign.status]}`}>
            {CAMPAIGN_STATUS_LABELS[campaign.status]}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/dashboard/campaigns/${campaign._id}/donations`)}
          >
            <HandCoins className="h-4 w-4 mr-1.5" /> View Donations
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/campaigns/${campaign._id}/edit`)}>
            <Pencil className="h-4 w-4 mr-1.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-4">
                {campaign.coverImage ? (
                  <img
                    src={getAssetUrl(campaign.coverImage)}
                    alt={campaign.title}
                    className="h-20 w-20 rounded-md object-cover border shrink-0"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md bg-slate-100 shrink-0">
                    <ImageOff className="h-5 w-5 text-slate-400" />
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold text-slate-800">{campaign.title}</p>
                  <p className="text-xs text-slate-400">/{campaign.slug}</p>
                  {campaign.isFeatured && (
                    <span className="mt-1 inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Short Description</p>
                <p className="text-slate-700">{campaign.shortDescription}</p>
              </div>

              <div>
                <p className="text-muted-foreground text-xs">Full Description</p>
                <p className="text-slate-700 whitespace-pre-wrap">{campaign.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Start Date</p>
                  <p className="text-slate-700">{formatDate(campaign.startDate)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">End Date</p>
                  <p className="text-slate-700">{formatDate(campaign.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {campaign.gallery && campaign.gallery.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {campaign.gallery.map((url) => (
                    <a key={url} href={getAssetUrl(url)} target="_blank" rel="noreferrer">
                      <img
                        src={getAssetUrl(url)}
                        alt=""
                        className="h-20 w-20 rounded-md object-cover border"
                      />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: funding + meta */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Funding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-slate-800">{formatCurrency(campaign.raisedAmount)}</p>
                  <p className="text-xs text-muted-foreground">of {formatCurrency(campaign.goalAmount)}</p>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-(--color-blue)"
                    style={{ width: `${preciseProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{progressLabel} funded</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-muted-foreground text-xs">Verified Donors</p>
                <p className="text-slate-700 font-medium">{campaign.totalDonors}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Campaign ID</p>
                <p className="text-slate-700 font-mono text-xs break-all">{campaign._id}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Created</p>
                <p className="text-slate-700">{formatDateTime(campaign.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Last Updated</p>
                <p className="text-slate-700">{formatDateTime(campaign.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{campaign.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              If this campaign has no donations on record, it's permanently deleted along with its images.
              Otherwise it's soft-deleted — hidden from public listings, but the record and donation history
              are kept. This action can't be undone from the UI.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
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

export default CampaignDetailPage;
