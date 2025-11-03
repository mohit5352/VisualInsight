import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Bottom Sheet Component
 * 
 * A slide-up panel component that provides a non-intrusive alternative to modals.
 * Slides up from the bottom of the screen with a backdrop.
 * 
 * @future-enhancements:
 * - Size variants (small, medium, large, full)
 * - Custom backdrop opacity
 * - Animation speed control
 * - Keyboard shortcuts (ESC to close)
 * - Swipe down to dismiss (mobile)
 * - Focus trap management
 */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: BottomSheetProps) {
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "relative w-full bg-card border-t border-border rounded-t-2xl shadow-2xl",
          "animate-in slide-in-from-bottom-4 duration-300",
          "max-h-[85vh] flex flex-col",
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
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

