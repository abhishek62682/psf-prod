import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CareerFormPayload } from "@/config/api/career.api";
import {
  CAREER_EMPLOYMENT_TYPES,
  CAREER_EMPLOYMENT_TYPE_LABELS,
  CAREER_WORK_MODES,
  CAREER_WORK_MODE_LABELS,
  CAREER_STATUSES,
  CAREER_STATUS_LABELS,
} from "@/config/careerConstants";

// Mirrors src/career/careerValidation.js on the backend.
const careerSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required." }),
  employmentType: z.enum(CAREER_EMPLOYMENT_TYPES),
  workMode: z.enum(CAREER_WORK_MODES),
  location: z.string().trim().min(1, { message: "Location is required." }),
  description: z.string().trim().min(1, { message: "Description is required." }),
  experience: z.string().trim().min(1, { message: "Experience is required." }),
  qualification: z.string().trim().min(1, { message: "Qualification is required." }),
  status: z.enum(CAREER_STATUSES),
});

export type CareerFormValues = z.infer<typeof careerSchema>;

interface CareerFormProps {
  defaultValues?: Partial<CareerFormValues>;
  onSubmit: (payload: CareerFormPayload) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

export function CareerForm({ defaultValues, onSubmit, isSubmitting, submitLabel }: CareerFormProps) {
  const form = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      title: "",
      employmentType: "full-time",
      workMode: "on-site",
      location: "",
      description: "",
      experience: "",
      qualification: "",
      status: "active",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold">Posting Details</h2>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Programme Coordinator" {...field} />
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
                    <Textarea rows={5} placeholder="Role summary shown on the public careers page" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input placeholder="1–3 Years Experience" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qualification</FormLabel>
                    <FormControl>
                      <Input placeholder="Bachelor's in Social Work / Related Field" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="px-6 py-5">
            <h2 className="text-sm font-semibold">Type & Location</h2>
          </div>
          <div className="px-6 pb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employment Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAREER_EMPLOYMENT_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {CAREER_EMPLOYMENT_TYPE_LABELS[t]}
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
              name="workMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Mode</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CAREER_WORK_MODES.map((m) => (
                        <SelectItem key={m} value={m}>
                          {CAREER_WORK_MODE_LABELS[m]}
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Hojai, Assam" {...field} />
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
                      {CAREER_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {CAREER_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="theme" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="animate-spin mr-2 h-4 w-4" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
