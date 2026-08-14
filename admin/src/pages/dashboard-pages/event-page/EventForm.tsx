import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, ImagePlus, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadImages } from "@/config/api/upload.api";
import type { EventFormPayload, EventStat, EventActivity } from "@/config/api/event.api";
import { getAssetUrl } from "@/Utils/constant";

const EVENT_MIN_IMAGES = 1;
const EVENT_MAX_IMAGES = 6;

// Mirrors src/event/eventValidation.js on the backend.
const eventSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required." }),
  category: z.string().trim().min(1, { message: "Category is required." }),
  description: z.string().trim().min(1, { message: "Description is required." }),
  eventDate: z.string().optional(),
});

export type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  initialImages?: string[];
  initialStats?: EventStat[];
  initialActivities?: EventActivity[];
  onSubmit: (payload: EventFormPayload) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function EventForm({
  defaultValues,
  initialImages,
  initialStats,
  initialActivities,
  onSubmit,
  isSubmitting,
  submitLabel,
}: EventFormProps) {
  const [images, setImages] = useState<string[]>(initialImages ?? []);
  const [imagesTouched, setImagesTouched] = useState(false);
  const [stats, setStats] = useState<EventStat[]>(initialStats ?? []);
  const [activities, setActivities] = useState<EventActivity[]>(initialActivities ?? []);
  const imagesInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      eventDate: "",
      ...defaultValues,
    },
  });

  const imagesMutation = useMutation({
    mutationFn: (files: File[]) => uploadImages(files, "event"),
    onSuccess: (data) => {
      setImages((prev) => [...prev, ...data.urls].slice(0, EVENT_MAX_IMAGES));
      setImagesTouched(true);
      toast.success(`${data.count} image(s) uploaded`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Photo upload failed", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = EVENT_MAX_IMAGES - images.length;
    if (files.length > remaining) {
      toast.error(`You can add at most ${EVENT_MAX_IMAGES} photos total.`);
    }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length > 0) imagesMutation.mutate(toUpload);
    if (imagesInputRef.current) imagesInputRef.current.value = "";
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((i) => i !== url));
    setImagesTouched(true);
  };

  const imagesError =
    imagesTouched && images.length < EVENT_MIN_IMAGES
      ? `Upload at least ${EVENT_MIN_IMAGES} photo.`
      : null;

  const addStat = () => {
    setStats((prev) => [...prev, { value: "", label: "" }]);
  };

  const updateStat = (index: number, field: keyof EventStat, value: string) => {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
  };

  const addActivity = () => {
    setActivities((prev) => [...prev, { title: "", description: "" }]);
  };

  const updateActivity = (index: number, field: keyof EventActivity, value: string) => {
    setActivities((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (values: EventFormValues) => {
    setImagesTouched(true);
    if (images.length < EVENT_MIN_IMAGES || images.length > EVENT_MAX_IMAGES) {
      toast.error(`Events need between ${EVENT_MIN_IMAGES} and ${EVENT_MAX_IMAGES} photos.`);
      return;
    }
    const cleanStats = stats.filter((s) => s.value?.trim() && s.label?.trim());
    const cleanActivities = activities.filter((a) => a.title?.trim() && a.description?.trim());
    onSubmit({
      ...values,
      eventDate: values.eventDate || undefined,
      images,
      stats: cleanStats.length > 0 ? cleanStats : undefined,
      activities: cleanActivities.length > 0 ? cleanActivities : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold">Event Details</h2>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Environment & Sustainability" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="World Environment Day Plantation Drive" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={5} placeholder="What happened at this event" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date (optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <p className="text-sm font-medium mb-2">
                Photos <span className="text-muted-foreground font-normal">(1–{EVENT_MAX_IMAGES}, at least 1 required)</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {images?.map((url) => (
                  <div key={url} className="relative h-20 w-20">
                    <img src={getAssetUrl(url)} alt="" className="h-20 w-20 rounded-md object-cover border" />
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white p-0.5 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < EVENT_MAX_IMAGES && (
                  <button
                    type="button"
                    disabled={imagesMutation.isPending}
                    onClick={() => imagesInputRef.current?.click()}
                    className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center text-muted-foreground hover:border-slate-400"
                  >
                    {imagesMutation.isPending ? (
                      <LoaderCircle className="animate-spin h-5 w-5" />
                    ) : (
                      <ImagePlus className="h-5 w-5" />
                    )}
                  </button>
                )}
                <input
                  ref={imagesInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleImagesChange}
                />
              </div>
              {imagesError && <p className="text-sm text-red-500 mt-2">{imagesError}</p>}
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP · Max 5MB each</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Key Activities</h2>
            <Button type="button" variant="outline" size="sm" onClick={addActivity}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Activity
            </Button>
          </div>
          {activities?.length > 0 && (
            <div className="px-6 pb-6 space-y-3">
              {activities?.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Input
                    placeholder="Activity title"
                    value={activity?.title ?? ""}
                    onChange={(e) => updateActivity(index, "title", e.target.value)}
                    className="w-1/2"
                  />
                  <Textarea
                    rows={2}
                    placeholder="Short description"
                    value={activity?.description ?? ""}
                    onChange={(e) => updateActivity(index, "description", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeActivity(index)}
                    className="shrink-0 rounded-full bg-red-50 text-red-600 p-1.5 hover:bg-red-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Impact Stats</h2>
            <Button type="button" variant="outline" size="sm" onClick={addStat}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Stat
            </Button>
          </div>
          {stats?.length > 0 && (
            <div className="px-6 pb-6 space-y-3">
              {stats?.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="Value"
                    value={stat?.value ?? ""}
                    onChange={(e) => updateStat(index, "value", e.target.value)}
                    className="w-32"
                  />
                  <Input
                    placeholder="Label"
                    value={stat?.label ?? ""}
                    onChange={(e) => updateStat(index, "label", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeStat(index)}
                    className="shrink-0 rounded-full bg-red-50 text-red-600 p-1.5 hover:bg-red-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="theme" disabled={isSubmitting || imagesMutation.isPending}>
            {isSubmitting && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
