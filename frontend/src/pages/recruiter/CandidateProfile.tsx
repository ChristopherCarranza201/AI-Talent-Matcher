import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MatchScore } from "@/components/shared/MatchScore";
import { SkillTag } from "@/components/shared/SkillTag";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Calendar,
  Download,
  Send,
  Star,
  Briefcase,
  GraduationCap,
  Award,
  CheckCircle,
  Clock,
} from "lucide-react";

const candidate = {
  id: 1,
  name: "Sarah Chen",
  email: "sarah.chen@email.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  role: "Senior React Developer",
  score: 94,
  status: "shortlisted",
  avatar: null,
  linkedin: "linkedin.com/in/sarahchen",
  github: "github.com/sarahchen",
  portfolio: "sarahchen.dev",
  summary: "Passionate software engineer with 8+ years of experience building scalable web applications. Specialized in React ecosystem and modern frontend architectures. Led multiple successful product launches and mentored junior developers.",
  skills: [
    { name: "React", level: "expert", confidence: 98 },
    { name: "TypeScript", level: "expert", confidence: 95 },
    { name: "Node.js", level: "advanced", confidence: 88 },
    { name: "GraphQL", level: "advanced", confidence: 85 },
    { name: "AWS", level: "intermediate", confidence: 75 },
    { name: "Docker", level: "intermediate", confidence: 72 },
  ],
  experience: [
    {
      title: "Senior Frontend Engineer",
      company: "TechCorp Inc.",
      duration: "2021 - Present",
      description: "Led the frontend team in rebuilding the main product using React and TypeScript. Improved performance by 40% and reduced bundle size by 30%.",
    },
    {
      title: "Frontend Developer",
      company: "StartupXYZ",
      duration: "2018 - 2021",
      description: "Built and maintained multiple React applications. Implemented design system used across all products.",
    },
    {
      title: "Junior Developer",
      company: "WebAgency",
      duration: "2016 - 2018",
      description: "Developed responsive websites and web applications for various clients.",
    },
  ],
  education: [
    {
      degree: "MS Computer Science",
      school: "Stanford University",
      year: "2016",
    },
    {
      degree: "BS Computer Science",
      school: "UC Berkeley",
      year: "2014",
    },
  ],
  matchBreakdown: {
    skills: 95,
    experience: 92,
    education: 90,
    location: 100,
  },
  appliedFor: "Senior Frontend Developer",
  appliedDate: "Dec 14, 2024",
};

export default function CandidateProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "shortlisted":
        return "bg-success/10 text-success border-success/30";
      case "reviewed":
        return "bg-primary/10 text-primary border-primary/30";
      case "new":
        return "bg-info/10 text-info border-info/30";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Candidate Profile</h1>
          <p className="text-muted-foreground">
            Viewing application for {candidate.appliedFor}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Download CV
          </Button>
          <Link to="/recruiter/accepted">
            <Button variant="outline" className="gap-2 text-success border-success/30 hover:bg-success/10">
              <CheckCircle className="w-4 h-4" />
              Accept Candidate
            </Button>
          </Link>
          <Button className="gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
            <Send className="w-4 h-4" />
            Send Interview Invite
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={candidate.avatar || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {candidate.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{candidate.name}</h2>
                <p className="text-muted-foreground">{candidate.role}</p>
                <Badge
                  variant="outline"
                  className={`mt-2 ${getStatusColor(candidate.status)}`}
                >
                  {candidate.status}
                </Badge>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {candidate.email}
                </a>
                <a
                  href={`tel:${candidate.phone}`}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {candidate.phone}
                </a>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {candidate.location}
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <a
                  href={`https://${candidate.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
                <a
                  href={`https://${candidate.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href={`https://${candidate.portfolio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Match Score Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Match Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-6">
                <MatchScore score={candidate.score} size="lg" />
              </div>
              <div className="space-y-4">
                {Object.entries(candidate.matchBreakdown).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{key}</span>
                      <span className="font-medium">{value}%</span>
                    </div>
                    <Progress value={value} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applied for</p>
                  <p className="font-semibold">{candidate.appliedFor}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Applied on</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {candidate.appliedDate}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {candidate.summary}
              </p>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Skills & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill) => (
                  <SkillTag
                    key={skill.name}
                    skill={skill.name}
                    level={skill.level as any}
                    confidence={skill.confidence}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {candidate.experience.map((exp, index) => (
                  <div key={index} className="relative pl-6 pb-6 last:pb-0">
                    {index !== candidate.experience.length - 1 && (
                      <div className="absolute left-[7px] top-3 bottom-0 w-[2px] bg-border" />
                    )}
                    <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary/10 border-2 border-primary" />
                    <div>
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {exp.company} • {exp.duration}
                      </p>
                      <p className="text-sm mt-2 text-muted-foreground">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidate.education.map((edu, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-sm text-muted-foreground">
                        {edu.school} • {edu.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}