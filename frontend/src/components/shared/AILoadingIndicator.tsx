import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AILoadingIndicatorProps {
  text?: string;
  className?: string;
}

export function AILoadingIndicator({ text = "AI is analyzing...", className }: AILoadingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full animate-pulse" />
      </div>
      <span className="text-sm text-muted-foreground">{text}</span>
      <div className="typing-indicator flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
      </div>
    </div>
  );
}