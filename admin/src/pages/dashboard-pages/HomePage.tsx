import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStats } from "@/config/api/dashboard.api";
import { useQuery } from "@tanstack/react-query";
import { SectionCards } from "@/components/section-cards";
import { LoaderCircle } from "lucide-react";
import { formatIndianCurrencyShort } from "@/lib/utils";

const formatDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const HomePage = () => {
  // GET /api/dashboard already embeds the latest 5 verified donors
  // (stats.recentDonors) — no need for a second request to
  // /api/dashboard/recent-donors just to show the same thing here.
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getStats,
    staleTime: 30_000,
  });

  const recentDonors = stats?.recentDonors ?? [];

  return (
    <div className="flex flex-col">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/home">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Home</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex flex-col gap-6">
        {statsLoading && (
          <div className="flex items-center justify-center py-8 text-sm text-slate-500 gap-2">
            <LoaderCircle className="animate-spin h-4 w-4" /> Loading stats...
          </div>
        )}
        {statsError && (
          <p className="py-4 text-sm text-red-500">Couldn't load dashboard stats. Check your connection.</p>
        )}
        {stats && <SectionCards data={stats} />}

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Donors</CardTitle>
            <CardDescription className="mt-0.5">
              Latest verified donations across all campaigns.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading && (
              <div className="flex items-center justify-center py-8 text-sm text-slate-500 gap-2">
                <LoaderCircle className="animate-spin h-4 w-4" /> Loading...
              </div>
            )}
            {statsError && (
              <p className="py-8 text-center text-sm text-red-500">Couldn't load recent donors.</p>
            )}
            {!statsLoading && !statsError && recentDonors.length === 0 && (
              <p className="py-8 text-center text-sm text-slate-400">No verified donations yet.</p>
            )}
            {!statsLoading && !statsError && recentDonors.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                      <TableHead className="text-xs font-semibold text-slate-600">Donor</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Campaign</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Amount</TableHead>
                      <TableHead className="text-xs font-semibold text-slate-600">Verified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDonors.map((donor, i) => (
                      <TableRow key={donor._id ?? i} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                        <TableCell className="py-3.5">
                          <p className="text-sm text-slate-700">{donor.name}</p>
                          {donor.email && <p className="text-xs text-slate-400">{donor.email}</p>}
                        </TableCell>
                        <TableCell className="py-3.5 text-sm text-slate-500">
                          {donor.campaignId?.title ?? "—"}
                        </TableCell>
                        <TableCell className="py-3.5 text-sm text-slate-700">{formatIndianCurrencyShort(donor.amount)}</TableCell>
                        <TableCell className="py-3.5 text-sm text-slate-600 whitespace-nowrap">
                          {formatDate(donor.verifiedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
