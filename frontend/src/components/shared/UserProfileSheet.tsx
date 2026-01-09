import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { updateProfile, uploadAvatar } from "@/services/api";
import { Save, User } from "lucide-react";

interface UserProfileSheetProps {
  children: React.ReactNode;
}

export function UserProfileSheet({ children }: UserProfileSheetProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: "",
    role_title: "",
    avatar_url: "",
  });

  // Load user data when sheet opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        full_name: user.full_name || "",
        role_title: user.role_title || "",
        avatar_url: user.avatar_url || "",
      });
    }
  }, [user, isOpen]);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setProfileData((prev) => ({ ...prev, avatar_url: "" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
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
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.detail || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Edit Profile
          </SheetTitle>
          <SheetDescription>
            Update your profile information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Profile Picture Upload */}
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

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={profileData.full_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, full_name: e.target.value })
                }
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-role-title">Role</Label>
              <Input
                id="profile-role-title"
                value={profileData.role_title}
                onChange={(e) =>
                  setProfileData({ ...profileData, role_title: e.target.value })
                }
                placeholder="e.g. HR Manager, Software Developer"
              />
              <p className="text-xs text-muted-foreground">
                Enter your job title or position
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
