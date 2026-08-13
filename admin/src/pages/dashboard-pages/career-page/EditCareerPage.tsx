import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle } from "lucide-react";
import { getCareerById, updateCareer } from "@/config/api/career.api";
import type { CareerFormPayload } from "@/config/api/career.api";
import { CareerForm } from "./CareerForm";

const EditCareerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: career, isLoading, isError } = useQuery({
    queryKey: ["career", id],
    queryFn: () => getCareerById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (payload: CareerFormPayload) => updateCareer(career!._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      queryClient.invalidateQueries({ queryKey: ["career", id] });
      toast.success("Career posting updated");
      navigate("/dashboard/careers");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update posting", {
        description: error.response?.data?.message ?? "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/careers">Careers</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 max-w-3xl">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
            <LoaderCircle className="animate-spin h-4 w-4" /> Loading posting...
          </div>
        )}

        {isError && (
          <p className="py-24 text-center text-sm text-red-500">
            Couldn't load this posting. It may have been deleted.
          </p>
        )}

        {career && (
          <CareerForm
            defaultValues={{
              title: career.title,
              employmentType: career.employmentType,
              workMode: career.workMode,
              location: career.location,
              description: career.description,
              experience: career.experience,
              qualification: career.qualification,
              status: career.status,
            }}
            onSubmit={(payload) => mutation.mutate(payload)}
            isSubmitting={mutation.isPending}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditCareerPage;
