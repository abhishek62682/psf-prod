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
import { getCampaignById, updateCampaign } from "@/config/api/campaign.api";
import type { CampaignFormPayload } from "@/config/api/campaign.api";
import { CampaignForm } from "./CampaignForm";

const EditCampaignPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading, isError } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (payload: CampaignFormPayload) => updateCampaign(campaign!._id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      toast.success("Campaign updated");
      navigate("/dashboard/campaigns");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update campaign", {
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
          {campaign && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/campaigns/${campaign._id}`}>
                  {campaign.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Edit</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 max-w-3xl">
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-sm text-muted-foreground gap-2">
            <LoaderCircle className="animate-spin h-4 w-4" /> Loading campaign...
          </div>
        )}

        {isError && (
          <p className="py-24 text-center text-sm text-red-500">
            Couldn't load this campaign. It may have been deleted.
          </p>
        )}

        {campaign && (
          <CampaignForm
            mode="edit"
            defaultValues={{
              title: campaign.title,
              slug: campaign.slug,
              shortDescription: campaign.shortDescription,
              description: campaign.description,
              goalAmount: campaign.goalAmount,
              startDate: campaign.startDate,
              endDate: campaign.endDate,
              isFeatured: campaign.isFeatured,
              status: campaign.status,
            }}
            initialCoverImage={campaign.coverImage}
            initialGallery={campaign.gallery}
            onSubmit={(payload) => mutation.mutate(payload)}
            isSubmitting={mutation.isPending}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditCampaignPage;
