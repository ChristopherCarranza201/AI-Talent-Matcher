import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MatchScore } from "@/components/shared/MatchScore";
import { SkillTag } from "@/components/shared/SkillTag";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Filter,
  Eye,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowUpDown,
  UserCheck,
  XCircle,
  FileText,
} from "lucide-react";
import { getAllRecruiterApplications, updateApplicationStatus } from "@/services/api";
import type { JobApplication } from "@/types/api";

export default function CandidatePipeline() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: applications = [], isLoading } = useQuery<JobApplication[]>({
    queryKey: ["recruiterApplications"],
    queryFn: () => getAllRecruiterApplications(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: number; status: string }) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterApplications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error?.response?.data?.detail || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-info/10 text-info border-info/30";
      case "reviewed":
        return "bg-primary/10 text-primary border-primary/30";
      case "shortlisted":
        return "bg-success/10 text-success border-success/30";
      case "accepted":
        return "bg-success/20 text-success border-success/50";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "";
    }
  };

  const handleViewProfile = (application: JobApplication) => {
    navigate(`/recruiter/candidates/${application.candidate.id}`);
  };

  const handleReject = (applicationId: number) => {
    updateStatusMutation.mutate({
      applicationId,
      status: "rejected",
    });
  };

  const handleAccept = (applicationId: number) => {
    updateStatusMutation.mutate({
      applicationId,
      status: "hired",
    });
    navigate("/recruiter/accepted");
  };

  const formatAppliedDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, yyyy");
    } catch {
      return "";
    }
  };

  const parseSkills = (skillsString: string | null | undefined): string[] => {
    if (!skillsString) return [];
    return skillsString.split(",").map((s) => s.trim()).filter(Boolean);
  };

  // Transform applications to candidate-like structure for display
  const candidates = useMemo(() => {
    return applications.map((app) => {
      // Parse skills if available (this would come from parsed CV data later)
      // For now, we'll use empty array - skills will be added when CV parsing is implemented
      const skills: string[] = []; // Placeholder - will be populated from parsed CV data

      return {
        id: app.application_id,
        applicationId: app.application_id,
        name: app.candidate.full_name || "Unknown",
        location: app.candidate.location || "Not specified",
        experience: "N/A", // Placeholder - will be populated from parsed CV data
        education: "N/A", // Placeholder - will be populated from parsed CV data
        score: 0, // Placeholder - match score will be calculated later
        skills,
        appliedFor: app.job_title || "Unknown Position",
        appliedDate: formatAppliedDate(app.applied_at),
        appliedAt: app.applied_at,
        status: app.display_status || app.status,
        originalStatus: app.status,
        lastUploadFile: app.candidate.last_upload_file,
        candidateId: app.candidate.id,
      };
    });
  }, [applications]);

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.appliedFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = filterStatus === "all" || c.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.score - a.score;
        if (sortBy === "date") return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime();
        return a.name.localeCompare(b.name);
      });
  }, [candidates, searchQuery, filterStatus, sortBy]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Candidate Pipeline</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage candidates sorted by AI match score
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="score">Match Score</SelectItem>
              <SelectItem value="date">Applied Date</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCandidates.length} candidates
      </p>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate, index) => (
          <Card
            key={candidate.id}
            className="hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Match Score */}
                <div className="flex lg:flex-col items-center lg:items-center gap-4 lg:gap-2">
                  <MatchScore score={candidate.score} size="md" />
                </div>

                {/* Candidate Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {candidate.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{candidate.name}</h3>
                          <Badge variant="outline" className={getStatusColor(candidate.status)}>
                            {candidate.status}
                          </Badge>
                        </div>
                        {candidate.lastUploadFile && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            <span>CV uploaded</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Applied: {candidate.appliedDate}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {candidate.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {candidate.education}
                    </span>
                  </div>

                  {/* Skills */}
                  {candidate.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill) => (
                        <SkillTag key={skill} skill={skill} className="text-xs" />
                      ))}
                    </div>
                  )}

                  {/* Applied For */}
                  <p className="text-xs text-muted-foreground">
                    Applied for: <span className="text-foreground font-medium">{candidate.appliedFor}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleViewProfile(applications.find((app) => app.application_id === candidate.applicationId)!)}
                  >
                    <Eye className="w-4 h-4" />
                    View Profile
                  </Button>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <Mail className="w-4 h-4" />
                    Contact
                  </Button>
                  {candidate.status !== "accepted" && candidate.status !== "rejected" ? (
                    <>
                      <Button
                        size="sm"
                        className="w-full gap-2 bg-success hover:bg-success/90"
                        onClick={() => handleAccept(candidate.applicationId)}
                      >
                        <UserCheck className="w-4 h-4" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                        onClick={() => handleReject(candidate.applicationId)}
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </Button>
                    </>
                  ) : candidate.status === "accepted" ? (
                    <Link to="/recruiter/accepted" className="w-full">
                      <Button variant="outline" size="sm" className="w-full gap-2 text-success border-success/30">
                        <UserCheck className="w-4 h-4" />
                        View Accepted
                      </Button>
                    </Link>
                  ) : (
                    <Badge variant="outline" className="justify-center py-2 text-destructive border-destructive/30">
                      Rejected
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No candidates found</h3>
          <p className="text-muted-foreground">
            {searchQuery || filterStatus !== "all"
              ? "Try adjusting your search or filters"
              : "No applications received yet"}
          </p>
        </div>
      )}
    </div>
  );
}
