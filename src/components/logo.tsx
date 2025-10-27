import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 24, height: 24 },
  md: { width: 30, height: 30 },
  lg: { width: 30, height: 30 },
};

export function Logo({ size = "md", className = "" }: LogoProps) {
  const dimensions = sizeMap[size];

  return (
    <Image
      src="/favicon.ico"
      alt="Logo"
      width={dimensions.width}
      height={dimensions.height}
      className={className}
      priority
    />
  );
}
