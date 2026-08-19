import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, ImagePlus, X, Plus, FileText, FilePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Editor from "@/components/Editor";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadImages, uploadDocuments } from "@/config/api/upload.api";
import type { EventFormPayload, EventStat, EventActivity, EventDocument } from "@/config/api/event.api";
import { getAssetUrl } from "@/Utils/constant";

const EVENT_MIN_IMAGES = 1;
const EVENT_MAX_IMAGES = 6;
const EVENT_MAX_DOCUMENTS = 6;

// Mirrors src/event/eventValidation.js on the backend.
const eventSchema = z
  .object({
    title: z.string().trim().min(1, { message: "Title is required." }),
    category: z.string().trim().min(1, { message: "Category is required." }),
    description: z
      .string()
      .trim()
      .refine((val) => val.replace(/<[^>]*>/g, "").trim().length > 0, {
        message: "Description is required.",
      }),
    eventStartDate: z.string().optional(),
    eventEndDate: z.string().optional(),
  })
  .refine(
    (data) => !data.eventStartDate || !data.eventEndDate || data.eventEndDate >= data.eventStartDate,
    { message: "End date must be on or after the start date.", path: ["eventEndDate"] }
  );

export type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormValues>;
  initialImages?: string[];
  initialDocuments?: EventDocument[];
  initialStats?: EventStat[];
  initialActivities?: EventActivity[];
  onSubmit: (payload: EventFormPayload) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function EventForm({
  defaultValues,
  initialImages,
  initialDocuments,
  initialStats,
  initialActivities,
  onSubmit,
  isSubmitting,
  submitLabel,
}: EventFormProps) {
  const [images, setImages] = useState<string[]>(initialImages ?? []);
  const [imagesTouched, setImagesTouched] = useState(false);
  const [documents, setDocuments] = useState<EventDocument[]>(initialDocuments ?? []);
  const [stats, setStats] = useState<EventStat[]>(initialStats ?? []);
  const [activities, setActivities] = useState<EventActivity[]>(initialActivities ?? []);
  const imagesInputRef = useRef<HTMLInputElement | null>(null);
  const documentsInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      eventStartDate: "",
      eventEndDate: "",
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

  const defaultDocumentLabel = (fileName: string) =>
    fileName.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").trim() || fileName;

  const documentsMutation = useMutation({
    mutationFn: (files: File[]) => uploadDocuments(files, "event"),
    onSuccess: (data, files) => {
      const uploaded = data.urls.map((url, i) => ({
        url,
        label: defaultDocumentLabel(files[i]?.name ?? url.split("/").pop() ?? url),
      }));
      setDocuments((prev) => [...prev, ...uploaded].slice(0, EVENT_MAX_DOCUMENTS));
      toast.success(`${data.count} document(s) uploaded`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Document upload failed", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const handleDocumentsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = EVENT_MAX_DOCUMENTS - documents.length;
    if (files.length > remaining) {
      toast.error(`You can add at most ${EVENT_MAX_DOCUMENTS} PDFs total.`);
    }
    const toUpload = files.slice(0, remaining);
    if (toUpload.length > 0) documentsMutation.mutate(toUpload);
    if (documentsInputRef.current) documentsInputRef.current.value = "";
  };

  const removeDocument = (url: string) => {
    setDocuments((prev) => prev.filter((d) => d.url !== url));
  };

  const updateDocumentLabel = (url: string, label: string) => {
    setDocuments((prev) => prev.map((d) => (d.url === url ? { ...d, label } : d)));
  };

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
    const cleanDocuments = documents.map((d) => ({
      url: d.url,
      label: d.label.trim() || defaultDocumentLabel(d.url.split("/").pop() ?? d.url),
    }));
    onSubmit({
      ...values,
      eventStartDate: values.eventStartDate || undefined,
      eventEndDate: values.eventEndDate || undefined,
      images,
      documents: cleanDocuments,
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
                    <Editor
                      content={field.value}
                      setContent={field.onChange}
                      placeholder="What happened at this event? Add links with the Link button."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Start Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eventEndDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event End Date (optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div>
              <p className="text-sm font-medium mb-2">
                Documents{" "}
                <span className="text-muted-foreground font-normal">
                  (optional, up to {EVENT_MAX_DOCUMENTS} PDFs)
                </span>
              </p>
              <div className="space-y-2">
                {documents?.map((doc) => (
                  <div
                    key={doc.url}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <Input
                      value={doc.label}
                      onChange={(e) => updateDocumentLabel(doc.url, e.target.value)}
                      placeholder="Document label"
                      className="h-8 flex-1"
                    />
                    <a
                      href={getAssetUrl(doc.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-blue-600 hover:underline"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.url)}
                      className="shrink-0 rounded-full bg-red-50 text-red-600 p-1 hover:bg-red-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {documents.length < EVENT_MAX_DOCUMENTS && (
                  <button
                    type="button"
                    disabled={documentsMutation.isPending}
                    onClick={() => documentsInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-slate-400"
                  >
                    {documentsMutation.isPending ? (
                      <LoaderCircle className="animate-spin h-4 w-4" />
                    ) : (
                      <FilePlus className="h-4 w-4" />
                    )}
                    Add PDF
                  </button>
                )}
                <input
                  ref={documentsInputRef}
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleDocumentsChange}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">PDF only · Max 10MB each</p>
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
          <Button
            type="submit"
            variant="theme"
            disabled={isSubmitting || imagesMutation.isPending || documentsMutation.isPending}
          >
            {isSubmitting && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
