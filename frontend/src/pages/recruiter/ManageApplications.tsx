import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MatchScore } from "@/components/shared/MatchScore";
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Mail,
  Clock,
} from "lucide-react";

type ApplicationStatus = "under_review" | "applied" | "offer_received" | "rejected";

interface Application {
  id: number;
  candidateName: string;
  email: string;
  role: string;
  vacancy: string;
  appliedDate: string;
  score: number;
  status: ApplicationStatus;
  avatar: string | null;
}

const initialApplications: Application[] = [
  {
    id: 1,
    candidateName: "Sarah Chen",
    email: "sarah.chen@email.com",
    role: "Senior React Developer",
    vacancy: "Senior Frontend Developer",
    appliedDate: "Dec 14, 2024",
    score: 94,
    status: "under_review",
    avatar: null,
  },
  {
    id: 2,
    candidateName: "Michael Johnson",
    email: "m.johnson@email.com",
    role: "Full Stack Engineer",
    vacancy: "Senior Frontend Developer",
    appliedDate: "Dec 13, 2024",
    score: 89,
    status: "applied",
    avatar: null,
  },
  {
    id: 3,
    candidateName: "Emily Davis",
    email: "emily.d@email.com",
    role: "Frontend Developer",
    vacancy: "UX Designer",
    appliedDate: "Dec 12, 2024",
    score: 85,
    status: "offer_received",
    avatar: null,
  },
  {
    id: 4,
    candidateName: "James Wilson",
    email: "james.w@email.com",
    role: "React Native Developer",
    vacancy: "Product Manager",
    appliedDate: "Dec 11, 2024",
    score: 78,
    status: "applied",
    avatar: null,
  },
  {
    id: 5,
    candidateName: "Lisa Anderson",
    email: "lisa.a@email.com",
    role: "Software Engineer",
    vacancy: "DevOps Engineer",
    appliedDate: "Dec 10, 2024",
    score: 72,
    status: "rejected",
    avatar: null,
  },
];

const statusOptions: { value: ApplicationStatus; label: string }[] = [
  { value: "applied", label: "Applied" },
  { value: "under_review", label: "Under Review" },
  { value: "offer_received", label: "Offer Received" },
  { value: "rejected", label: "Rejected" },
];

export default function ManageApplications() {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return "bg-info/10 text-info border-info/30";
      case "under_review":
        return "bg-warning/10 text-warning border-warning/30";
      case "offer_received":
        return "bg-success/10 text-success border-success/30";
      case "rejected":
        return "bg-muted text-muted-foreground";
      default:
        return "";
    }
  };

  const handleStatusChange = (applicationId: number, newStatus: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status: newStatus } : app
      )
    );
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.vacancy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Manage Applications</h1>
        <p className="text-muted-foreground mt-1">
          Review applications and update candidate statuses
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status === "applied").length}
                </p>
                <p className="text-xs text-muted-foreground">Applied</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Search className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status === "under_review").length}
                </p>
                <p className="text-xs text-muted-foreground">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status === "offer_received").length}
                </p>
                <p className="text-xs text-muted-foreground">Offers Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Filter className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {applications.filter((a) => a.status === "rejected").length}
                </p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or vacancy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Applied For</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={app.avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {app.candidateName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{app.candidateName}</p>
                        <p className="text-xs text-muted-foreground">{app.role}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{app.vacancy}</p>
                  </TableCell>
                  <TableCell>
                    <MatchScore score={app.score} size="sm" showLabel={false} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {app.appliedDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value) =>
                        handleStatusChange(app.id, value as ApplicationStatus)
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <Badge variant="outline" className={getStatusColor(app.status)}>
                          {statusOptions.find((s) => s.value === app.status)?.label}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge variant="outline" className={getStatusColor(option.value)}>
                              {option.label}
                            </Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/recruiter/candidates/${app.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon">
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No applications found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
