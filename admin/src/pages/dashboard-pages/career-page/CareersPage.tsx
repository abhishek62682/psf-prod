import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { LoaderCircle, MoreHorizontal, Plus } from "lucide-react";
import { adminListCareers, deleteCareer, updateCareer } from "@/config/api/career.api";
import type { Career } from "@/config/api/career.api";
import {
  CAREER_STATUSES,
  CAREER_STATUS_LABELS,
  CAREER_STATUS_STYLES,
  CAREER_EMPLOYMENT_TYPE_LABELS,
  CAREER_WORK_MODE_LABELS,
} from "@/config/careerConstants";

const CareersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<Career | null>(null);

  const { data: careers, isLoading, isError } = useQuery({
    queryKey: ["admin-careers"],
    queryFn: adminListCareers,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: (typeof CAREER_STATUSES)[number] }) =>
      updateCareer(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      toast.success("Status updated");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update status", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCareer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      setDeleteTarget(null);
      toast.success("Career posting deleted");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to delete posting", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const list = careers ?? [];

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Careers</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Careers</h1>
          <p className="text-sm text-muted-foreground">
            Manage open positions shown on the public careers page.
          </p>
        </div>
        <Button variant="theme" onClick={() => navigate("/dashboard/careers/create")}>
          <Plus className="h-4 w-4 mr-1" /> New Posting
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto border border-slate-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="text-xs font-semibold text-slate-600">Title</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Type</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Location</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Experience</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Qualification</TableHead>
              <TableHead className="text-xs font-semibold text-slate-600">Status</TableHead>
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
                  Couldn't load career postings. Check your connection and try again.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && list.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-400">
                  No career postings yet. Create your first one.
                </TableCell>
              </TableRow>
            )}
            {list.map((c) => (
              <TableRow key={c._id} className="hover:bg-slate-50 border-b border-slate-100">
                <TableCell className="py-3 max-w-[240px]">
                  <p className="text-sm text-slate-700 truncate">{c.title}</p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{CAREER_EMPLOYMENT_TYPE_LABELS[c.employmentType]}</p>
                  <p className="text-xs text-slate-400">{CAREER_WORK_MODE_LABELS[c.workMode]}</p>
                </TableCell>
                <TableCell className="py-3">
                  <p className="text-sm text-slate-700">{c.location}</p>
                </TableCell>
                <TableCell className="py-3 max-w-[180px]">
                  <p className="text-sm text-slate-700 truncate">{c.experience}</p>
                </TableCell>
                <TableCell className="py-3 max-w-[220px]">
                  <p className="text-sm text-slate-700 truncate">{c.qualification}</p>
                </TableCell>
                <TableCell className="py-3">
                  <Select
                    value={c.status}
                    onValueChange={(status) =>
                      statusMutation.mutate({ id: c._id, status: status as (typeof CAREER_STATUSES)[number] })
                    }
                  >
                    <SelectTrigger className={`h-7 text-xs w-[110px] border ${CAREER_STATUS_STYLES[c.status]}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAREER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {CAREER_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
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
                      <DropdownMenuItem onClick={() => navigate(`/dashboard/careers/${c._id}/edit`)}>
                        Edit
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This soft-deletes the posting — it disappears from the public careers page but the record is
              kept. This action can't be undone from the UI.
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

export default CareersPage;
