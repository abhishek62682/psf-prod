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
import { createCampaign } from "@/config/api/campaign.api";
import type { CampaignFormPayload } from "@/config/api/campaign.api";
import { CampaignForm } from "./CampaignForm";

const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CampaignFormPayload) => createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign created", { description: "The campaign is now live in your list." });
      navigate("/dashboard/campaigns");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to create campaign", {
        description: error.response?.data?.message ?? "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/campaigns">Campaigns</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 max-w-3xl">
        <CampaignForm
          mode="create"
          onSubmit={(payload) => mutation.mutate(payload)}
          isSubmitting={mutation.isPending}
          submitLabel="Create Campaign"
        />
      </div>
    </div>
  );
};

export default CreateCampaignPage;
