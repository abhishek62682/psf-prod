// Mirrors src/career/careerConstants.js on the backend.
export const CAREER_EMPLOYMENT_TYPES = ["full-time", "part-time", "internship"] as const;
export const CAREER_WORK_MODES = ["on-site", "hybrid", "remote"] as const;
export const CAREER_STATUSES = ["active", "closed"] as const;

export type CareerEmploymentType = (typeof CAREER_EMPLOYMENT_TYPES)[number];
export type CareerWorkMode = (typeof CAREER_WORK_MODES)[number];
export type CareerStatus = (typeof CAREER_STATUSES)[number];

export const CAREER_EMPLOYMENT_TYPE_LABELS: Record<CareerEmploymentType, string> = {
  "full-time": "Full-Time",
  "part-time": "Part-Time",
  internship: "Internship",
};

export const CAREER_WORK_MODE_LABELS: Record<CareerWorkMode, string> = {
  "on-site": "On-Site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const CAREER_STATUS_LABELS: Record<CareerStatus, string> = {
  active: "Active",
  closed: "Closed",
};

export const CAREER_STATUS_STYLES: Record<CareerStatus, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
};
