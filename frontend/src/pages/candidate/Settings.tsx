import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadAvatar, updateCandidateProfile } from "@/services/api";
import {
  User,
  Save,
  MapPin,
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCandidate, setIsSavingCandidate] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: "",
    role_title: "",
    avatar_url: "",
  });

  const [candidateData, setCandidateData] = useState({
    location: "",
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        role_title: user.role_title || "",
        avatar_url: user.avatar_url || "",
      });
      if (user.candidate_profile) {
        setCandidateData({
          location: user.candidate_profile.location || "",
        });
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Upload image first if selected
      if (selectedImage) {
        const uploadResult = await uploadAvatar(selectedImage);
        setProfileData((prev) => ({
          ...prev,
          avatar_url: uploadResult.avatar_url,
        }));
        setSelectedImage(null);
      }

      // Update profile
      await updateProfile({
        full_name: profileData.full_name,
        role_title: profileData.role_title,
        avatar_url: profileData.avatar_url,
      });

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveCandidate = async () => {
    setIsSavingCandidate(true);
    try {
      await updateCandidateProfile({
        location: candidateData.location,
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Profile Updated",
        description: "Your candidate profile has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update candidate profile",
        variant: "destructive",
      });
    } finally {
      setIsSavingCandidate(false);
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setProfileData((prev) => ({ ...prev, avatar_url: "" }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Picture */}
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <ImageUpload
              currentImageUrl={profileData.avatar_url}
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              maxSizeMB={5}
            />
          </div>

          <Separator />

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profileData.full_name}
              onChange={(e) =>
                setProfileData({ ...profileData, full_name: e.target.value })
              }
            />
          </div>

          {/* Role Title */}
          <div className="space-y-2">
            <Label htmlFor="role_title">Role</Label>
            <Input
              id="role_title"
              value={profileData.role_title}
              onChange={(e) =>
                setProfileData({ ...profileData, role_title: e.target.value })
              }
              placeholder="e.g. Software Developer, Frontend Engineer"
            />
            <p className="text-xs text-muted-foreground">
              Enter your job title or position
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidate Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Candidate Information
          </CardTitle>
          <CardDescription>
            Update your candidate profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA"
              value={candidateData.location}
              onChange={(e) =>
                setCandidateData({ ...candidateData, location: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveCandidate}
              disabled={isSavingCandidate}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingCandidate ? "Saving..." : "Save Candidate Info"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
