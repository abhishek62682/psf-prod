import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { LoaderCircle, ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadImage, uploadImages } from "@/config/api/upload.api";
import type { CampaignFormPayload, Campaign } from "@/config/api/campaign.api";
import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_LABELS,
} from "@/config/campaignConstants";
import { getAssetUrl } from "@/Utils/constant";

// Mirrors src/campaign/campaignValidation.js on the backend.
const campaignSchema = z
  .object({
    title: z.string().trim().min(1, { message: "Title is required." }),
    slug: z.string().trim().optional(),
    shortDescription: z
      .string()
      .trim()
      .min(1, { message: "Short description is required." })
      .max(300, { message: "Short description must be at most 300 characters." }),
    description: z.string().min(1, { message: "Description is required." }),
    goalAmount: z.coerce.number().positive({ message: "Goal amount must be a positive number." }),
    startDate: z.string().min(1, { message: "Start date is required." }),
    endDate: z.string().min(1, { message: "End date is required." }),
    isFeatured: z.boolean(),
    status: z.enum(CAMPAIGN_STATUSES),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: "End date must be after start date.",
    path: ["endDate"],
  });

export type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CampaignFormValues>;
  initialCoverImage?: string;
  initialGallery?: string[];
  onSubmit: (payload: CampaignFormPayload) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

const toDateInputValue = (iso?: string) => (iso ? iso.slice(0, 10) : "");

export function CampaignForm({
  defaultValues,
  initialCoverImage,
  initialGallery,
  onSubmit,
  isSubmitting,
  submitLabel,
}: CampaignFormProps) {
  const [coverImage, setCoverImage] = useState<string>(initialCoverImage ?? "");
  const [gallery, setGallery] = useState<string[]>(initialGallery ?? []);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      slug: "",
      shortDescription: "",
      description: "",
      goalAmount: 0,
      startDate: "",
      endDate: "",
      isFeatured: false,
      status: "active",
      ...defaultValues,
    },
  });

  const coverMutation = useMutation({
    mutationFn: (file: File) => uploadImage(file, "thumbnail"),
    onSuccess: (data) => {
      setCoverImage(data.url);
      toast.success("Cover image uploaded");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Cover upload failed", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const galleryMutation = useMutation({
    mutationFn: (files: File[]) => uploadImages(files, "gallery"),
    onSuccess: (data) => {
      setGallery((prev) => [...prev, ...data.urls]);
      toast.success(`${data.count} image(s) uploaded`);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error("Gallery upload failed", {
        description: error.response?.data?.message ?? "Something went wrong.",
      });
    },
  });

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) coverMutation.mutate(file);
  };

  const handleGalleryChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) galleryMutation.mutate(files);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const removeGalleryImage = (url: string) => {
    setGallery((prev) => prev.filter((g) => g !== url));
  };

  const handleFormSubmit = (values: CampaignFormValues) => {
    onSubmit({
      ...values,
      slug: values.slug || undefined,
      coverImage,
      gallery,
    });
  };

  const uploading = coverMutation.isPending || galleryMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold">Campaign Details</h2>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Education For Every Child" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (optional — auto-generated from title if left blank)</FormLabel>
                  <FormControl>
                    <Input placeholder="education-for-every-child" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description (max 300 chars)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="One-line summary shown in listings" {...field} />
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
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea rows={8} placeholder="Full campaign description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Images */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold">Images</h2>
          </div>
          <div className="px-6 pb-6 space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Cover Image</p>
              <div className="flex items-center gap-4">
                {coverImage ? (
                  <img
                    src={getAssetUrl(coverImage)}
                    alt="Cover"
                    className="h-20 w-20 rounded-md object-cover border"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center text-muted-foreground">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={coverMutation.isPending}
                    onClick={() => coverInputRef.current?.click()}
                  >
                    {coverMutation.isPending && <LoaderCircle className="animate-spin mr-2 h-3.5 w-3.5" />}
                    {coverImage ? "Replace" : "Upload"}
                  </Button>
                  <span className="text-xs text-muted-foreground">JPG, PNG, WEBP · Max 5MB</span>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Gallery</p>
              <div className="flex flex-wrap gap-3">
                {gallery.map((url) => (
                  <div key={url} className="relative h-20 w-20">
                    <img src={getAssetUrl(url)} alt="" className="h-20 w-20 rounded-md object-cover border" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(url)}
                      className="absolute -top-2 -right-2 rounded-full bg-red-600 text-white p-0.5 hover:bg-red-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={galleryMutation.isPending}
                  onClick={() => galleryInputRef.current?.click()}
                  className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center text-muted-foreground hover:border-slate-400"
                >
                  {galleryMutation.isPending ? (
                    <LoaderCircle className="animate-spin h-5 w-5" />
                  ) : (
                    <ImagePlus className="h-5 w-5" />
                  )}
                </button>
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleGalleryChange}
                />
              </div>
              <span className="text-xs text-muted-foreground">Up to 10 images per request</span>
            </div>
          </div>
        </div>

        {/* Goal, dates, status */}
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold">Goal & Schedule</h2>
          </div>
          <div className="px-6 pb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="goalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} placeholder="1000000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAMPAIGN_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {CAMPAIGN_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={toDateInputValue(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={toDateInputValue(field.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 sm:col-span-2">
                  <FormLabel className="!mt-0">Featured campaign</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="theme" disabled={isSubmitting || uploading}>
            {isSubmitting && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
