import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mb-6 animate-fade-in-up">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {description}
      </p>
      {action && (
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          {action}
        </div>
      )}
    </div>
  );
}
