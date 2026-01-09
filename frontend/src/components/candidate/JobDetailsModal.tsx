import { parseISO, format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillTag } from "@/components/shared/SkillTag";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  FileText,
  CheckCircle2,
} from "lucide-react";
import type { JobPosition } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import { getMyApplications } from "@/services/api";

interface JobDetailsModalProps {
  job: JobPosition | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (jobId: number) => void;
  isApplying?: boolean;
}

export function JobDetailsModal({
  job,
  open,
  onOpenChange,
  onApply,
  isApplying = false,
}: JobDetailsModalProps) {
  const { data: myApplications = [] } = useQuery({
    queryKey: ["myApplications"],
    queryFn: getMyApplications,
    enabled: open, // Only fetch when modal is open
  });

  if (!job) return null;

  const appliedJobIds = new Set(myApplications.map((app) => app.job_position_id));
  const hasApplied = appliedJobIds.has(job.id);

  const parseSkills = (skillsString: string | null | undefined): string[] => {
    if (!skillsString) return [];
    return skillsString.split(",").map((s) => s.trim()).filter(Boolean);
  };

  const formatSalary = (salaryMin: number | null | undefined, salaryMax: number | null | undefined): string => {
    if (!salaryMin && !salaryMax) return "";
    if (salaryMin && salaryMax) {
      return `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}`;
    }
    if (salaryMin) {
      return `$${salaryMin.toLocaleString()}+`;
    }
    return `Up to $${salaryMax!.toLocaleString()}`;
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return "";
    try {
      const date = parseISO(dateString);
      return format(date, "MMMM d, yyyy");
    } catch {
      return "";
    }
  };

  const skills = parseSkills(job.job_skills);
  const salaryDisplay = formatSalary(job.optional_salary, job.optional_salary_max);
  const closingDate = formatDate(job.closing_date);
  const postedDate = formatDate(job.created_at);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{job.job_title}</DialogTitle>
          {job.company_name && (
            <DialogDescription className="flex items-center gap-2 text-base pt-2">
              <Building className="w-4 h-4" />
              <span className="font-medium">{job.company_name}</span>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Details Summary */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {job.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
            )}
            {job.employment_type && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-4 h-4" />
                <span>{job.employment_type}</span>
              </div>
            )}
            {salaryDisplay && (
              <div className="flex items-center gap-2 font-medium text-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{salaryDisplay}</span>
              </div>
            )}
            {postedDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Posted {postedDate}</span>
              </div>
            )}
            {closingDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Closes {closingDate}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Job Description */}
          {job.job_description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Job Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.job_description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.job_requirements && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Requirements</h3>
              <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {job.job_requirements}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            {hasApplied ? (
              <Button
                disabled
                className="flex-1 bg-success/10 text-success border-success/30 cursor-not-allowed"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Applied
              </Button>
            ) : (
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={() => onApply && onApply(job.id)}
                disabled={isApplying}
              >
                {isApplying ? "Applying..." : "Apply Now"}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
