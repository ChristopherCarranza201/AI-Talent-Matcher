import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { MatchScore } from "@/components/shared/MatchScore";
import { SkillTag } from "@/components/shared/SkillTag";
import {
  Search,
  Eye,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  Trash2,
  CheckCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { format } from "date-fns";

const acceptedCandidates = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Senior React Developer",
    location: "San Francisco, CA",
    score: 94,
    skills: ["React", "TypeScript", "Node.js"],
    acceptedFor: "Senior Frontend Developer",
    acceptedDate: "Dec 14, 2024",
    startDate: new Date("2025-01-15"),
    status: "confirmed",
    avatar: null,
  },
  {
    id: 2,
    name: "Michael Johnson",
    role: "Full Stack Engineer",
    location: "Remote",
    score: 89,
    skills: ["Python", "Django", "PostgreSQL"],
    acceptedFor: "Backend Developer",
    acceptedDate: "Dec 10, 2024",
    startDate: new Date("2025-01-08"),
    status: "pending",
    avatar: null,
  },
  {
    id: 3,
    name: "Emily Davis",
    role: "Frontend Developer",
    location: "New York, NY",
    score: 85,
    skills: ["Vue.js", "JavaScript", "CSS"],
    acceptedFor: "UX Developer",
    acceptedDate: "Dec 8, 2024",
    startDate: null,
    status: "pending",
    avatar: null,
  },
];

export default function AcceptedCandidates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [candidates, setCandidates] = useState(acceptedCandidates);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingCandidateId, setEditingCandidateId] = useState<number | null>(null);

  const getStatusBadge = (status: string, startDate: Date | null) => {
    if (status === "confirmed" && startDate) {
      return (
        <Badge className="bg-success/10 text-success border-success/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Confirmed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
        <Clock className="w-3 h-3 mr-1" />
        Pending Start Date
      </Badge>
    );
  };

  const handleSetStartDate = (candidateId: number, date: Date | undefined) => {
    if (date) {
      setCandidates(prev =>
        prev.map(c =>
          c.id === candidateId
            ? { ...c, startDate: date, status: "confirmed" }
            : c
        )
      );
      setEditingCandidateId(null);
    }
  };

  const handleRemoveCandidate = (candidateId: number) => {
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
  };

  const filteredCandidates = candidates.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.acceptedFor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmedCount = candidates.filter(c => c.status === "confirmed").length;
  const pendingCount = candidates.filter(c => c.status === "pending").length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Accepted Candidates</h1>
        <p className="text-muted-foreground mt-1">
          Manage accepted candidates and their start dates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{candidates.length}</p>
                <p className="text-sm text-muted-foreground">Total Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{confirmedCount}</p>
                <p className="text-sm text-muted-foreground">Start Date Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending Confirmation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or position..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

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
                        <AvatarImage src={candidate.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {candidate.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{candidate.name}</h3>
                          {getStatusBadge(candidate.status, candidate.startDate)}
                        </div>
                        <p className="text-muted-foreground">{candidate.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" />
                      {candidate.acceptedFor}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Accepted: {candidate.acceptedDate}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <SkillTag key={skill} skill={skill} className="text-xs" />
                    ))}
                  </div>

                  {/* Start Date */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-sm font-medium">Start Date:</span>
                    {candidate.startDate ? (
                      <Badge variant="outline" className="bg-success/5">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {format(candidate.startDate, "MMMM d, yyyy")}
                      </Badge>
                    ) : (
                      <Popover
                        open={editingCandidateId === candidate.id}
                        onOpenChange={(open) => setEditingCandidateId(open ? candidate.id : null)}
                      >
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            Set Start Date
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => handleSetStartDate(candidate.id, date)}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:justify-center">
                  <Link to={`/recruiter/candidates/${candidate.id}`} className="flex-1 lg:flex-none">
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Eye className="w-4 h-4" />
                      View Profile
                    </Button>
                  </Link>
                  {candidate.startDate && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1 lg:flex-none gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Change Date
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={candidate.startDate}
                          onSelect={(date) => handleSetStartDate(candidate.id, date)}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 lg:flex-none gap-2 text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveCandidate(candidate.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No accepted candidates</h3>
          <p className="text-muted-foreground">
            Accept candidates from the pipeline to see them here
          </p>
          <Link to="/recruiter/pipeline">
            <Button className="mt-4">Go to Pipeline</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
