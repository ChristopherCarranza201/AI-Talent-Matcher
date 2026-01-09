import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { format, addWeeks, parseISO } from "date-fns";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SkillTag } from "@/components/shared/SkillTag";
import { AILoadingIndicator } from "@/components/shared/AILoadingIndicator";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  CalendarIcon,
  Wand2,
  Edit,
  Copy,
} from "lucide-react";
import { generateJobDescription, generateRequirements, generateSkills, createJob, getJob, updateJob } from "@/services/api";
import { toast } from "sonner";
import type { JobPosition } from "@/types/api";

export default function VacancyCreate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  // Determine mode: create, edit, or view
  const isEditMode = location.pathname.includes("/edit");
  const isViewMode = id && !isEditMode;
  const isCreateMode = !id;

  const [isReadOnly, setIsReadOnly] = useState(isViewMode);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingRequirements, setIsGeneratingRequirements] = useState(false);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "",
    customType: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    closingDate: undefined as Date | undefined,
    sprintDuration: "",
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [publishDate] = useState(new Date());

  // Fetch job data if in edit or view mode
  const { data: jobData, isLoading: isLoadingJob } = useQuery<JobPosition>({
    queryKey: ["job", id],
    queryFn: () => getJob(Number(id!)),
    enabled: !!id,
  });

  // Load duplicate data from navigation state
  useEffect(() => {
    if (location.state?.duplicateData) {
      setFormData(location.state.duplicateData);
      if (location.state.duplicateSkills) {
        setSkills(location.state.duplicateSkills);
      }
    }
  }, [location.state]);

  // Load job data into form when fetched
  useEffect(() => {
    if (jobData) {
      const jobSkills = jobData.job_skills
        ? jobData.job_skills.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      
      setFormData({
        title: jobData.job_title || "",
        location: jobData.location || "",
        type: jobData.employment_type || "",
        customType: "",
        salaryMin: jobData.optional_salary?.toString() || "",
        salaryMax: jobData.optional_salary_max?.toString() || "",
        description: jobData.job_description || "",
        requirements: jobData.job_requirements || "",
        closingDate: jobData.closing_date ? parseISO(jobData.closing_date) : undefined,
        sprintDuration: jobData.sprint_duration || "",
      });
      setSkills(jobSkills);
    }
  }, [jobData]);

  // Calculate closing date when sprint is selected
  useEffect(() => {
    if (formData.sprintDuration && formData.sprintDuration !== "custom") {
      const weeks = parseInt(formData.sprintDuration);
      const calculatedDate = addWeeks(publishDate, weeks);
      setFormData((prev) => ({ ...prev, closingDate: calculatedDate }));
    }
  }, [formData.sprintDuration, publishDate]);

  // Auto-generate skills when description and requirements are filled
  useEffect(() => {
    const handleAutoGenerateSkills = async () => {
      if (
        formData.description &&
        formData.requirements &&
        skills.length === 0 &&
        !isGeneratingSkills
      ) {
        setIsGeneratingSkills(true);
        try {
          const result = await generateSkills({
            job_description: formData.description,
            requirements: formData.requirements,
          });
          const skillsString = result.skills.join(", ");
          setNewSkill(skillsString);
        } catch (error: any) {
          console.error("Failed to auto-generate skills:", error);
        } finally {
          setIsGeneratingSkills(false);
        }
      }
    };

    const timeoutId = setTimeout(handleAutoGenerateSkills, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData.description, formData.requirements, skills.length, isGeneratingSkills]);

  const handleGenerateJobDescription = async () => {
    if (!formData.title || !formData.type) {
      toast.error("Job Title and Employment Type are required");
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const result = await generateJobDescription({
        job_title: formData.title,
        employment_type: formData.type || formData.customType,
        context: formData.description || undefined,
      });
      setFormData((prev) => ({ ...prev, description: result.description }));
      toast.success("Job description generated successfully");
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to generate job description";
      toast.error(message);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGenerateRequirements = async () => {
    if (!formData.description) {
      toast.error("Job description is required to generate requirements");
      return;
    }

    if (!formData.type) {
      toast.error("Employment type is required");
      return;
    }

    setIsGeneratingRequirements(true);
    try {
      const result = await generateRequirements({
        job_description: formData.description,
        employment_type: formData.type || formData.customType,
      });
      setFormData((prev) => ({ ...prev, requirements: result.requirements }));
      toast.success("Requirements generated successfully");
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to generate requirements";
      toast.error(message);
    } finally {
      setIsGeneratingRequirements(false);
    }
  };

  const handleGenerateSkills = async () => {
    if (!formData.description || !formData.requirements) {
      toast.error("Job description and requirements are required");
      return;
    }

    setIsGeneratingSkills(true);
    try {
      const result = await generateSkills({
        job_description: formData.description,
        requirements: formData.requirements,
      });
      const skillsString = result.skills.join(", ");
      setNewSkill(skillsString);
      toast.success("Skills generated successfully");
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to generate skills";
      toast.error(message);
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  const handleApplySkills = () => {
    if (!newSkill.trim()) return;

    const skillsArray = newSkill
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !skills.includes(s));

    if (skillsArray.length > 0) {
      setSkills([...skills, ...skillsArray]);
      setNewSkill("");
      toast.success(`${skillsArray.length} skill(s) added`);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setValidationError("");

    // Validate required fields
    if (!formData.title) {
      setValidationError("Job title is required");
      return;
    }

    if (!formData.description) {
      setValidationError("Job description is required");
      return;
    }

    // Validate closing date or sprint duration for published vacancies
    if (!isDraft && !isEditMode) {
      if (!formData.sprintDuration && !formData.closingDate) {
        setValidationError("Please specify either Sprint Duration or Closing Date before publishing");
        return;
      }

      // If sprint duration is set, ensure closing date is calculated
      if (formData.sprintDuration && formData.sprintDuration !== "custom" && !formData.closingDate) {
        setValidationError("Closing date must be calculated from sprint duration");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const salaryMinValue = formData.salaryMin ? parseInt(formData.salaryMin) : null;
      const salaryMaxValue = formData.salaryMax ? parseInt(formData.salaryMax) : null;
      const employmentTypeValue = formData.type === "other" ? formData.customType : formData.type;

      const jobPayload = {
        job_title: formData.title,
        job_description: formData.description,
        job_requirements: formData.requirements || null,
        job_skills: skills.length > 0 ? skills.join(", ") : null,
        location: formData.location || null,
        employment_type: employmentTypeValue || null,
        optional_salary: salaryMinValue,
        optional_salary_max: salaryMaxValue,
        closing_date: formData.closingDate ? format(formData.closingDate, "yyyy-MM-dd") : null,
        sprint_duration: formData.sprintDuration || null,
        ...(isCreateMode && { status: isDraft ? "draft" : "open" }),
      };

      if (isEditMode && id) {
        // Update existing job
        await updateJob(Number(id), jobPayload);
        queryClient.invalidateQueries({ queryKey: ["myJobs"] });
        queryClient.invalidateQueries({ queryKey: ["job", id] });
        toast.success("Vacancy updated successfully");
        navigate(`/recruiter/vacancies/${id}`);
        setIsReadOnly(true);
      } else {
        // Create new job
        await createJob(jobPayload);
        queryClient.invalidateQueries({ queryKey: ["myJobs"] });
        toast.success(isDraft ? "Vacancy saved as draft" : "Vacancy published successfully");
        navigate("/recruiter/vacancies");
      }
    } catch (error: any) {
      const message = error?.response?.data?.detail || "Failed to save vacancy";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDuplicate = () => {
    // Navigate to create mode with pre-filled data
    navigate("/recruiter/vacancies/new", {
      state: {
        duplicateData: {
          ...formData,
          title: `${formData.title} (Copy)`,
        },
        duplicateSkills: skills,
      },
    });
  };

  const handleEnableEdit = () => {
    navigate(`/recruiter/vacancies/${id}/edit`);
  };

  // Update read-only state when route changes
  useEffect(() => {
    setIsReadOnly(isViewMode && !isEditMode);
  }, [isViewMode, isEditMode]);

  const canGenerateRequirements = formData.description && formData.type;
  const canGenerateSkills = formData.description && formData.requirements;

  if (isLoadingJob && (isEditMode || isViewMode)) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    if (isEditMode) return "Edit Vacancy";
    if (isViewMode) return jobData?.job_title || "View Vacancy";
    return "Create New Vacancy";
  };

  const getDescription = () => {
    if (isEditMode) return "Update the details of your job posting";
    if (isViewMode) return "View your job posting details";
    return "Fill in the details and let AI help you find the perfect candidates";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{getTitle()}</h1>
                <p className="text-muted-foreground mt-1">{getDescription()}</p>
              </div>
              {isViewMode && isReadOnly && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicate}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEnableEdit}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
          {validationError}
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Senior Frontend Developer"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isReadOnly}
                readOnly={isReadOnly}
                className={isReadOnly ? "bg-muted cursor-default" : ""}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="e.g. Remote, New York, NY"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                  className={isReadOnly ? "bg-muted cursor-default" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Employment Type *
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value, customType: "" })}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? "bg-muted cursor-default" : ""}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {formData.type === "other" && (
                  <Input
                    placeholder="Enter custom employment type"
                    value={formData.customType}
                    onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                    className={cn("mt-2", isReadOnly ? "bg-muted cursor-default" : "")}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Salary Range
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Min (e.g. 100000)"
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  className={cn("flex-1", isReadOnly ? "bg-muted cursor-default" : "")}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  placeholder="Max (e.g. 150000)"
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  className={cn("flex-1", isReadOnly ? "bg-muted cursor-default" : "")}
                  disabled={isReadOnly}
                  readOnly={isReadOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Job Description
            </CardTitle>
            <CardDescription>
              Describe the role and our AI will suggest relevant skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description *</Label>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateJobDescription}
                    disabled={!formData.title || !formData.type || isGeneratingDescription}
                    className="gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate with AI
                  </Button>
                )}
              </div>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={cn("min-h-[150px]", isReadOnly ? "bg-muted cursor-default" : "")}
                disabled={isReadOnly}
                readOnly={isReadOnly}
              />
              {isGeneratingDescription && (
                <AILoadingIndicator text="Generating description..." />
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="requirements">Requirements</Label>
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateRequirements}
                    disabled={!canGenerateRequirements || isGeneratingRequirements}
                    className="gap-2"
                  >
                    <Wand2 className="w-4 h-4" />
                    Generate with AI
                  </Button>
                )}
              </div>
              <Textarea
                id="requirements"
                placeholder="List the must-have qualifications and experience..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className={cn("min-h-[100px]", isReadOnly ? "bg-muted cursor-default" : "")}
                disabled={isReadOnly}
                readOnly={isReadOnly}
              />
              {isGeneratingRequirements && (
                <AILoadingIndicator text="Generating requirements..." />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Closing Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Closing Date
            </CardTitle>
            <CardDescription>
              Set when this vacancy should close for applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sprint Duration</Label>
                <Select
                  value={formData.sprintDuration}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sprintDuration: value })
                  }
                  disabled={isReadOnly}
                >
                  <SelectTrigger className={isReadOnly ? "bg-muted cursor-default" : ""}>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Week</SelectItem>
                    <SelectItem value="2">2 Weeks</SelectItem>
                    <SelectItem value="3">3 Weeks</SelectItem>
                    <SelectItem value="4">4 Weeks</SelectItem>
                    <SelectItem value="custom">Custom Date</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Closing date is calculated from publish date
                </p>
              </div>

              <div className="space-y-2">
                <Label>Closing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={isReadOnly}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.closingDate && "text-muted-foreground",
                        isReadOnly && "bg-muted cursor-default"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.closingDate ? (
                        format(formData.closingDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  {!isReadOnly && (
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.closingDate}
                        onSelect={(date) =>
                          setFormData({ ...formData, closingDate: date, sprintDuration: "custom" })
                        }
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  )}
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Required Skills
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Add skills that candidates should have for this role</span>
              {!isReadOnly && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSkills}
                  disabled={!canGenerateSkills || isGeneratingSkills}
                  className="gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Generate with AI
                </Button>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGeneratingSkills && (
              <AILoadingIndicator text="Generating skill suggestions..." />
            )}
            {/* Added Skills */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    removable={!isReadOnly}
                    onRemove={() => removeSkill(skill)}
                  />
                ))}
              </div>
            )}

            {/* Add Skill Input */}
            {!isReadOnly && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill (comma-separated for multiple)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleApplySkills();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplySkills}
                  disabled={!newSkill.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {!isReadOnly && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            {isCreateMode && (
              <Button
                type="button"
                variant="secondary"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
              >
                Save as Draft
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Publishing..."
                : isEditMode
                ? "Update Vacancy"
                : "Publish Vacancy"}
            </Button>
          </div>
        )}
        {isReadOnly && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/recruiter/vacancies")}>
              Back to Vacancies
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
