import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: "primary" | "secondary" | "accent" | "rainbow";
}

const gradientClasses = {
  primary: "bg-gradient-to-r from-primary to-primary/70",
  secondary: "bg-gradient-to-r from-secondary to-secondary/70", 
  accent: "bg-gradient-to-r from-accent to-accent/70",
  rainbow: "bg-gradient-to-r from-primary via-secondary to-accent",
};

export function GradientText({
  children,
  className,
  gradient = "primary",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-clip-text text-transparent",
        gradientClasses[gradient],
        className
      )}
    >
      {children}
    </span>
  );
}
