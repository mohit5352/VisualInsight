import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  width?: "sm" | "md" | "lg" | "xl";
}

/**
 * Side Panel Component
 * 
 * A slide-in panel component that provides a non-intrusive alternative to modals.
 * Slides in from the right edge of the screen with a backdrop.
 * 
 * @future-enhancements:
 * - Left/right/top/bottom positioning variants
 * - Custom backdrop opacity
 * - Animation speed control
 * - Keyboard shortcuts (ESC to close)
 * - Focus trap management
 * - Resizable width
 */
export function SidePanel({
  open,
  onClose,
  title,
  description,
  children,
  className,
  width = "md",
}: SidePanelProps) {
  // Close on ESC key
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Width variants
  const widthClasses = {
    sm: "w-full max-w-sm",
    md: "w-full max-w-md",
    lg: "w-full max-w-lg",
    xl: "w-full max-w-xl",
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel */}
      <div
        className={cn(
          "relative bg-card border-l border-border shadow-2xl",
          "animate-in slide-in-from-right-4 duration-300",
          "h-full flex flex-col",
          widthClasses[width],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold">{title}</h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-4"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

