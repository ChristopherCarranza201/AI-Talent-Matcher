import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SkillTagProps {
  skill: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  confidence?: number;
  removable?: boolean;
  onRemove?: () => void;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export function SkillTag({
  skill,
  level,
  confidence,
  removable = false,
  onRemove,
  variant = "secondary",
  className,
}: SkillTagProps) {
  const getLevelColor = (level?: string) => {
    switch (level) {
      case "expert":
        return "bg-primary/10 text-primary border-primary/30";
      case "advanced":
        return "bg-secondary/10 text-secondary border-secondary/30";
      case "intermediate":
        return "bg-accent/10 text-accent border-accent/30";
      case "beginner":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "";
    }
  };

  return (
    <Badge
      variant={variant}
      className={cn(
        "gap-1.5 px-2.5 py-1 font-medium transition-all hover:scale-105",
        level && getLevelColor(level),
        className
      )}
    >
      <span>{skill}</span>
      {confidence !== undefined && (
        <span className="text-xs opacity-70">({confidence}%)</span>
      )}
      {level && (
        <span className="text-[10px] uppercase opacity-60">{level}</span>
      )}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:text-destructive transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}