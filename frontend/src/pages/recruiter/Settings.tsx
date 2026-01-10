import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadAvatar, updateRecruiterProfile } from "@/services/api";
import {
  User,
  Mail,
  Lock,
  Bell,
  Building,
  Globe,
  Save,
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: "",
    role_title: "",
    avatar_url: "",
  });

  const [accountSettings, setAccountSettings] = useState({
    email: "jane.doe@company.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    newApplicants: true,
    interviewReminders: true,
    statusUpdates: false,
    weeklyDigest: true,
  });

  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    website: "https://techcorp.com",
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        role_title: user.role_title || "",
        avatar_url: user.avatar_url || "",
      });
      if (user.recruiter_profile) {
        setCompanyInfo({
          companyName: user.recruiter_profile.company_name || "",
          website: "https://techcorp.com",
        });
      }
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Upload image first if selected
      // The upload_avatar endpoint already updates the profile with avatar_url
      if (selectedImage) {
        const uploadResult = await uploadAvatar(selectedImage);
        
        // Update local state with the new avatar URL from server response
        const newAvatarUrl = uploadResult.avatar_url || uploadResult.profile?.avatar_url;
        setProfileData((prev) => ({
          ...prev,
          avatar_url: newAvatarUrl || prev.avatar_url,
        }));
        setSelectedImage(null);
        
        // Update the user data in the cache immediately with the response from server
        if (uploadResult.profile) {
          queryClient.setQueryData(["currentUser"], uploadResult.profile);
        }
      }

      // Update profile with other fields (full_name, role_title) if they changed
      // Do NOT include avatar_url here since it's already updated by upload_avatar
      const hasChanges = 
        profileData.full_name !== (user?.full_name || "") ||
        profileData.role_title !== (user?.role_title || "");

      if (hasChanges) {
        const updatePayload: { full_name?: string; role_title?: string } = {};
        
        if (profileData.full_name !== (user?.full_name || "")) {
          updatePayload.full_name = profileData.full_name;
        }
        
        if (profileData.role_title !== (user?.role_title || "")) {
          updatePayload.role_title = profileData.role_title;
        }

        const updateResult = await updateProfile(updatePayload);
        
        // Update cache with the updated profile
        if (updateResult.data) {
          queryClient.setQueryData(["currentUser"], updateResult.data);
        }
      }

      // Invalidate and refetch to ensure we have the latest data from server
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      await queryClient.refetchQueries({ queryKey: ["currentUser"] });

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

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setProfileData((prev) => ({ ...prev, avatar_url: "" }));
  };

  const handleSaveAccount = () => {
    if (accountSettings.newPassword && accountSettings.newPassword !== accountSettings.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Account Updated",
      description: "Your account settings have been saved.",
    });
    setAccountSettings((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleSaveCompany = async () => {
    setIsSavingCompany(true);
    try {
      await updateRecruiterProfile({
        company_name: companyInfo.companyName,
      });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast({
        title: "Company Info Updated",
        description: "Your company information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update company info",
        variant: "destructive",
      });
    } finally {
      setIsSavingCompany(false);
    }
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
              placeholder="e.g. HR Manager, Senior Recruiter"
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

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Update your email and password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={accountSettings.email}
              onChange={(e) =>
                setAccountSettings({ ...accountSettings, email: e.target.value })
              }
            />
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Change Password
            </Label>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={accountSettings.currentPassword}
                  onChange={(e) =>
                    setAccountSettings({
                      ...accountSettings,
                      currentPassword: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={accountSettings.newPassword}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        newPassword: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={accountSettings.confirmPassword}
                    onChange={(e) =>
                      setAccountSettings({
                        ...accountSettings,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveAccount} className="gap-2">
              <Save className="w-4 h-4" />
              Save Account Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Applicant Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a new candidate applies to your vacancies
              </p>
            </div>
            <Switch
              checked={notifications.newApplicants}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, newApplicants: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Interview Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Receive reminders before scheduled interviews
              </p>
            </div>
            <Switch
              checked={notifications.interviewReminders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, interviewReminders: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Status Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when candidate statuses change
              </p>
            </div>
            <Switch
              checked={notifications.statusUpdates}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, statusUpdates: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your recruitment activity
              </p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, weeklyDigest: checked })
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveNotifications} className="gap-2">
              <Save className="w-4 h-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" />
            Company Information
          </CardTitle>
          <CardDescription>
            Update your company details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyInfo.companyName}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, companyName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={companyInfo.website}
              onChange={(e) =>
                setCompanyInfo({ ...companyInfo, website: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveCompany}
              disabled={isSavingCompany}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSavingCompany ? "Saving..." : "Save Company Info"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
