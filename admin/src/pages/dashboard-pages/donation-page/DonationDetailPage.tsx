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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { adminGetDonation, verifyDonation, rejectDonation } from "@/config/api/donation.api";
import {
  DONATION_STATUS_LABELS,
  DONATION_STATUS_STYLES,
} from "@/config/donationConstants";
import { getAssetUrl } from "@/Utils/constant";
import { formatIndianCurrencyShort } from "@/lib/utils";

const formatDateTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const DonationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [reason, setReason] = useState("");

  const { data: donation, isLoading, isError } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => adminGetDonation(id!),
    enabled: !!id,
  });

  const invalidateEverything = () => {
    // Verifying/rejecting changes donation status, campaign raisedAmount/
    // totalDonors, and dashboard aggregates — invalidate all of them.
    queryClient.invalidateQueries({ queryKey: ["donation", id] });
    queryClient.invalidateQueries({ queryKey: ["admin-donations"] });
    queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-recent-donors"] });
  };

  const verifyMutation = useMutation({
    mutationFn: () => verifyDonation(id!, remarks || undefined),
    onSuccess: () => {
      invalidateEverything();
      setVerifyOpen(false);
      toast.success("Donation verified", { description: "Campaign totals have been updated." });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to verify donation", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectDonation(id!, reason),
    onSuccess: () => {
      invalidateEverything();
      setRejectOpen(false);
      toast.success("Donation rejected");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to reject donation", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
        <LoaderCircle className="animate-spin h-4 w-4" /> Loading donation...
      </div>
    );
  }

  if (isError || !donation) {
    return <p className="py-24 text-center text-sm text-red-500">Couldn't load this donation.</p>;
  }

  const campaign = typeof donation.campaignId === "object" ? donation.campaignId : null;
  const isPending = donation.status === "pending";

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/donations">Donations</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{donation.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/donations")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Donations
        </Button>
        <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${DONATION_STATUS_STYLES[donation.status]}`}>
          {DONATION_STATUS_LABELS[donation.status]}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Donor Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Name</p>
                <p className="text-slate-700">{donation.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Email</p>
                <p className="text-slate-700">{donation.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="text-slate-700">{donation.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Amount</p>
                <p className="text-slate-700 font-semibold">{formatIndianCurrencyShort(donation.amount)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Transaction ID</p>
                <p className="text-slate-700 font-mono">{donation.transactionId}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Payment Date</p>
                <p className="text-slate-700">{formatDateTime(donation.paymentDate)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">80G Tax Exemption</p>
                <p className="text-slate-700">{donation.is80GApplicable ? "Claimed" : "Not Claimed"}</p>
              </div>
              {donation.is80GApplicable && (
                <div>
                  <p className="text-muted-foreground text-xs">PAN Number</p>
                  <p className="text-slate-700 font-mono">{donation.panNumber ?? "—"}</p>
                </div>
              )}
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-xs">Campaign</p>
                {campaign ? (
                  <Link
                    to={`/dashboard/campaigns/${campaign._id}/edit`}
                    className="text-blue-600 hover:underline"
                  >
                    {campaign.title}
                  </Link>
                ) : (
                  <p className="text-slate-700">—</p>
                )}
              </div>
              {donation.message && (
                <div className="sm:col-span-2">
                  <p className="text-muted-foreground text-xs">Message</p>
                  <p className="text-slate-700">{donation.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payment Screenshot</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={getAssetUrl(donation.paymentScreenshot)} target="_blank" rel="noreferrer">
                <img
                  src={getAssetUrl(donation.paymentScreenshot)}
                  alt="Payment screenshot"
                  className="max-h-[420px] rounded-lg border object-contain"
                />
              </a>
              <p className="text-xs text-muted-foreground mt-2">Click to open full size.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donation.auditLog.map((entry, i) => {
                  const performer =
                    typeof entry.performedBy === "object" && entry.performedBy ? entry.performedBy.name : null;
                  return (
                    <div key={i} className="flex gap-3 text-sm">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-slate-400 shrink-0" />
                      <div>
                        <p className="text-slate-700 capitalize">
                          {entry.action}
                          {performer && <span className="text-muted-foreground"> by {performer}</span>}
                        </p>
                        {entry.remarks && <p className="text-xs text-muted-foreground mt-0.5">{entry.remarks}</p>}
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(entry.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPending ? (
                <>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setVerifyOpen(true)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Verify Donation
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setRejectOpen(true)}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject Donation
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This donation has already been {donation.status}. No further action available.
                </p>
              )}

              {donation.status === "verified" && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <Separator className="mb-2" />
                  Verified {formatDateTime(donation.verifiedAt)}
                  {donation.remarks && <p className="mt-1">"{donation.remarks}"</p>}
                </div>
              )}
              {donation.status === "rejected" && donation.rejectionReason && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <Separator className="mb-2" />
                  Reason: {donation.rejectionReason}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verify dialog */}
      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify this donation?</DialogTitle>
            <DialogDescription>
              This adds {formatIndianCurrencyShort(donation.amount)} to the campaign's raised amount and can't be undone
              from here.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Optional remarks (e.g. Payment verified successfully.)"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)} disabled={verifyMutation.isPending}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
            >
              {verifyMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              Confirm Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this donation?</DialogTitle>
            <DialogDescription>A rejection reason is required.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason (e.g. Screenshot is unclear.)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!reason.trim()) {
                  toast.error("Rejection reason is required.");
                  return;
                }
                rejectMutation.mutate();
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationDetailPage;
