import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { createCareer } from "@/config/api/career.api";
import type { CareerFormPayload } from "@/config/api/career.api";
import { CareerForm } from "./CareerForm";

const CreateCareerPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CareerFormPayload) => createCareer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-careers"] });
      toast.success("Career posting created", { description: "It's now live on the public careers page." });
      navigate("/dashboard/careers");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to create posting", {
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
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 max-w-3xl">
        <CareerForm
          onSubmit={(payload) => mutation.mutate(payload)}
          isSubmitting={mutation.isPending}
          submitLabel="Create Posting"
        />
      </div>
    </div>
  );
};

export default CreateCareerPage;
