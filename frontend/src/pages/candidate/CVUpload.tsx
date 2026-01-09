import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SkillTag } from "@/components/shared/SkillTag";
import { AILoadingIndicator } from "@/components/shared/AILoadingIndicator";
import {
  Upload,
  FileText,
  Check,
  Plus,
  X,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const mockDetectedSkills = [
  { name: "React", confidence: 95 },
  { name: "TypeScript", confidence: 92 },
  { name: "Node.js", confidence: 88 },
  { name: "JavaScript", confidence: 98 },
  { name: "CSS", confidence: 85 },
  { name: "Git", confidence: 90 },
  { name: "REST APIs", confidence: 87 },
  { name: "Agile", confidence: 75 },
];

export default function CVUpload() {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "complete">("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectedSkills, setDetectedSkills] = useState<typeof mockDetectedSkills>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    title: "",
    summary: "",
    linkedin: "",
    github: "",
    portfolio: "",
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadState("uploading");
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploadState("analyzing");
        
        // Simulate AI analysis
        setTimeout(() => {
          setDetectedSkills(mockDetectedSkills);
          setSelectedSkills(mockDetectedSkills.slice(0, 5).map(s => s.name));
          setProfileData({
            name: "Alex Johnson",
            email: "alex.johnson@email.com",
            phone: "+1 (555) 987-6543",
            location: "Seattle, WA",
            title: "Software Developer",
            summary: "Experienced software developer with 5+ years in web development. Passionate about creating intuitive user experiences and writing clean, maintainable code.",
            linkedin: "linkedin.com/in/alexjohnson",
            github: "github.com/alexjohnson",
            portfolio: "alexjohnson.dev",
          });
          setUploadState("complete");
        }, 2500);
      }
    }, 100);
  };

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSave = () => {
    // Mock save
    console.log("Saving profile:", { ...profileData, skills: selectedSkills });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Upload your CV and let AI detect your skills automatically
        </p>
      </div>

      {/* CV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            CV / Resume
          </CardTitle>
          <CardDescription>
            Upload your CV and we'll automatically extract your information and skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadState === "idle" && (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
            </label>
          )}

          {uploadState === "uploading" && (
            <div className="space-y-4 py-8">
              <div className="flex items-center justify-center gap-3">
                <Upload className="w-6 h-6 text-primary animate-pulse" />
                <span className="text-sm font-medium">Uploading your CV...</span>
              </div>
              <Progress value={uploadProgress} className="h-2 max-w-md mx-auto" />
              <p className="text-xs text-center text-muted-foreground">{uploadProgress}%</p>
            </div>
          )}

          {uploadState === "analyzing" && (
            <div className="py-8 text-center">
              <AILoadingIndicator text="AI is analyzing your CV and extracting skills..." className="justify-center" />
              <p className="text-sm text-muted-foreground mt-4">
                This usually takes a few seconds...
              </p>
            </div>
          )}

          {uploadState === "complete" && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-success">CV uploaded successfully!</p>
                <p className="text-sm text-muted-foreground">
                  We've extracted your information and detected {detectedSkills.length} skills
                </p>
              </div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm">
                  Replace CV
                </Button>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      {uploadState === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Detected Skills
            </CardTitle>
            <CardDescription>
              Review AI-detected skills and add any that are missing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Skills */}
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => {
                const detected = detectedSkills.find(s => s.name === skill);
                return (
                  <SkillTag
                    key={skill}
                    skill={skill}
                    confidence={detected?.confidence}
                    removable
                    onRemove={() => removeSkill(skill)}
                  />
                );
              })}
            </div>

            {/* Add Skill */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill(newSkill);
                  }
                }}
              />
              <Button variant="outline" onClick={() => addSkill(newSkill)}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Suggested from CV */}
            {detectedSkills.filter(s => !selectedSkills.includes(s.name)).length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Also detected in your CV:</Label>
                <div className="flex flex-wrap gap-2">
                  {detectedSkills
                    .filter(s => !selectedSkills.includes(s.name))
                    .map((skill) => (
                      <Badge
                        key={skill.name}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => addSkill(skill.name)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {skill.name} ({skill.confidence}%)
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Profile Information */}
      {uploadState === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Review and edit your extracted profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone
                </Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                value={profileData.summary}
                onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio</Label>
                <Input
                  id="portfolio"
                  value={profileData.portfolio}
                  onChange={(e) => setProfileData({ ...profileData, portfolio: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      {uploadState === "complete" && (
        <div className="flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            Save Profile
          </Button>
        </div>
      )}
    </div>
  );
}