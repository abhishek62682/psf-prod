import { Target, Activity, Clock, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StatsData } from "@/config/api/dashboard.api";
import { formatCurrency, formatIndianCurrencyShort } from "@/lib/utils";

export function SectionCards({ data }: { data: StatsData }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Active Campaigns</CardTitle>
          <Target className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">{data.activeCampaigns}</p>
          <p className="mt-1 text-xs text-slate-500">of {data.totalCampaigns} total</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pending Donations</CardTitle>
          <Clock className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">{data.pendingDonations}</p>
          <p className="mt-1 text-xs text-slate-500">awaiting verification</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Verified Donations</CardTitle>
          <Activity className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">{data.verifiedDonations}</p>
          <p className="mt-1 text-xs text-slate-500">{data.todayDonations} today</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Raised</CardTitle>
          <Wallet className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-800">
            {formatIndianCurrencyShort(data.totalDonationAmount)}
          </p>
          <p className="mt-1 text-xs text-slate-500">{formatCurrency(data.totalDonationAmount)} collected</p>
        </CardContent>
      </Card>
    </div>
  );
}
