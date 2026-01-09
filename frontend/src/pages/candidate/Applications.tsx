import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  MessageSquare,
  ChevronRight,
  Briefcase,
} from "lucide-react";

const applications = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    salary: "$140k - $180k",
    appliedDate: "Dec 14, 2024",
    status: "interview_scheduled",
    statusDate: "Dec 16, 2024",
    interviewDate: "Dec 20, 2024 at 2:00 PM",
    progress: 75,
    timeline: [
      { step: "Applied", date: "Dec 14", completed: true },
      { step: "CV Review", date: "Dec 15", completed: true },
      { step: "Interview", date: "Dec 20", completed: false, current: true },
      { step: "Decision", date: "TBD", completed: false },
    ],
  },
  {
    id: 2,
    title: "React Developer",
    company: "StartupXYZ",
    location: "Remote",
    salary: "$120k - $150k",
    appliedDate: "Dec 12, 2024",
    status: "under_review",
    statusDate: "Dec 13, 2024",
    progress: 50,
    timeline: [
      { step: "Applied", date: "Dec 12", completed: true },
      { step: "CV Review", date: "Dec 13", completed: true, current: true },
      { step: "Interview", date: "TBD", completed: false },
      { step: "Decision", date: "TBD", completed: false },
    ],
  },
  {
    id: 3,
    title: "Full Stack Engineer",
    company: "InnovateTech",
    location: "New York, NY",
    salary: "$130k - $160k",
    appliedDate: "Dec 10, 2024",
    status: "offer_received",
    statusDate: "Dec 15, 2024",
    progress: 100,
    offerDetails: "Offer: $145k + equity",
    timeline: [
      { step: "Applied", date: "Dec 10", completed: true },
      { step: "CV Review", date: "Dec 11", completed: true },
      { step: "Interview", date: "Dec 13", completed: true },
      { step: "Offer", date: "Dec 15", completed: true, current: true },
    ],
  },
  {
    id: 4,
    title: "Frontend Engineer",
    company: "DigitalFirst",
    location: "Austin, TX",
    salary: "$110k - $140k",
    appliedDate: "Dec 8, 2024",
    status: "rejected",
    statusDate: "Dec 12, 2024",
    progress: 25,
    timeline: [
      { step: "Applied", date: "Dec 8", completed: true },
      { step: "CV Review", date: "Dec 10", completed: true },
      { step: "Rejected", date: "Dec 12", completed: true, failed: true },
    ],
  },
  {
    id: 5,
    title: "UI Developer",
    company: "DesignStudio",
    location: "Remote",
    salary: "$80/hr",
    appliedDate: "Dec 5, 2024",
    status: "applied",
    statusDate: "Dec 5, 2024",
    progress: 25,
    timeline: [
      { step: "Applied", date: "Dec 5", completed: true, current: true },
      { step: "CV Review", date: "Pending", completed: false },
      { step: "Interview", date: "TBD", completed: false },
      { step: "Decision", date: "TBD", completed: false },
    ],
  },
];

export default function Applications() {
  const [activeTab, setActiveTab] = useState("all");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "interview_scheduled":
        return (
          <Badge className="bg-success/10 text-success border-success/30">
            Interview Scheduled
          </Badge>
        );
      case "under_review":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/30">
            Under Review
          </Badge>
        );
      case "applied":
        return (
          <Badge className="bg-info/10 text-info border-info/30">Applied</Badge>
        );
      case "offer_received":
        return (
          <Badge className="bg-success/10 text-success border-success/30">
            Offer Received
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-muted text-muted-foreground">Rejected</Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (activeTab === "all") return true;
    if (activeTab === "active")
      return ["applied", "under_review", "interview_scheduled"].includes(app.status);
    if (activeTab === "offers") return app.status === "offer_received";
    if (activeTab === "rejected") return app.status === "rejected";
    return true;
  });

  const stats = {
    total: applications.length,
    active: applications.filter((a) =>
      ["applied", "under_review", "interview_scheduled"].includes(a.status)
    ).length,
    offers: applications.filter((a) => a.status === "offer_received").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-success">{stats.offers}</p>
            <p className="text-sm text-muted-foreground">Offers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-muted-foreground">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
          <TabsTrigger value="offers">Offers ({stats.offers})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((app, index) => (
          <Card
            key={app.id}
            className="hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{app.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Building className="w-4 h-4" />
                        <span>{app.company}</span>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {app.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {app.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Applied: {app.appliedDate}
                    </span>
                  </div>

                  {/* Interview Info */}
                  {app.interviewDate && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Interview: {app.interviewDate}
                      </span>
                    </div>
                  )}

                  {/* Offer Info */}
                  {app.offerDetails && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{app.offerDetails}</span>
                    </div>
                  )}

                  {/* Progress Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{app.progress}%</span>
                    </div>
                    <Progress value={app.progress} className="h-2" />
                    <div className="flex justify-between mt-3">
                      {app.timeline.map((step, i) => (
                        <div
                          key={i}
                          className={`flex flex-col items-center text-center ${
                            step.failed
                              ? "text-destructive"
                              : step.completed
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${
                              step.failed
                                ? "bg-destructive/10"
                                : step.completed
                                ? "bg-primary/10"
                                : "bg-muted"
                            } ${step.current ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          >
                            {step.failed ? (
                              <XCircle className="w-4 h-4" />
                            ) : step.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                          </div>
                          <span className="text-xs font-medium">{step.step}</span>
                          <span className="text-[10px]">{step.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 lg:justify-center lg:min-w-[140px]">
                  {app.status === "offer_received" && (
                    <>
                      <Button className="flex-1 lg:flex-none bg-gradient-to-r from-success to-accent hover:opacity-90">
                        Accept Offer
                      </Button>
                      <Button variant="outline" className="flex-1 lg:flex-none">
                        Negotiate
                      </Button>
                    </>
                  )}
                  {app.status !== "rejected" && app.status !== "offer_received" && (
                    <>
                      <Button variant="outline" className="flex-1 lg:flex-none gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message
                      </Button>
                      <Button variant="ghost" className="flex-1 lg:flex-none gap-2">
                        <FileText className="w-4 h-4" />
                        View Job
                      </Button>
                    </>
                  )}
                  {app.status === "rejected" && (
                    <Link to="/candidate/jobs">
                      <Button variant="outline" className="w-full gap-2">
                        Find Similar Jobs
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No applications found</h3>
          <p className="text-muted-foreground mb-4">
            Start applying to jobs to track your progress here
          </p>
          <Link to="/candidate/jobs">
            <Button className="gap-2">
              <Briefcase className="w-4 h-4" />
              Browse Jobs
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}