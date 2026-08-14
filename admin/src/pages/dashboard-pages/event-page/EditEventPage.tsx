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
import { getEventById, updateEvent } from "@/config/api/event.api";
import type { EventFormPayload } from "@/config/api/event.api";
import { EventForm } from "./EventForm";

const EditEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEventById(id!),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: (payload: EventFormPayload) => updateEvent(event?._id ?? "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast.success("Event updated");
      navigate("/dashboard/events");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to update event", {
        description: error.response?.data?.message ?? "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/events">Events</BreadcrumbLink>
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
            <LoaderCircle className="animate-spin h-4 w-4" /> Loading event...
          </div>
        )}

        {isError && (
          <p className="py-24 text-center text-sm text-red-500">
            Couldn't load this event. It may have been deleted.
          </p>
        )}

        {event && (
          <EventForm
            defaultValues={{
              title: event?.title,
              category: event?.category,
              description: event?.description,
              eventStartDate: event?.eventStartDate ? event.eventStartDate.slice(0, 10) : "",
              eventEndDate: event?.eventEndDate ? event.eventEndDate.slice(0, 10) : "",
            }}
            initialImages={event?.images}
            initialStats={event?.stats}
            initialActivities={event?.activities}
            onSubmit={(payload) => mutation.mutate(payload)}
            isSubmitting={mutation.isPending}
            submitLabel="Save Changes"
          />
        )}
      </div>
    </div>
  );
};

export default EditEventPage;
