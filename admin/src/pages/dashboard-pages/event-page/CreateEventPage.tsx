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
import { createEvent } from "@/config/api/event.api";
import type { EventFormPayload } from "@/config/api/event.api";
import { EventForm } from "./EventForm";

const CreateEventPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: EventFormPayload) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event created", { description: "It's now live on the public Our Work page." });
      navigate("/dashboard/events");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Failed to create event", {
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
            <BreadcrumbPage>Create</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 max-w-3xl">
        <EventForm
          onSubmit={(payload) => mutation.mutate(payload)}
          isSubmitting={mutation.isPending}
          submitLabel="Create Event"
        />
      </div>
    </div>
  );
};

export default CreateEventPage;
