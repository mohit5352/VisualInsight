import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { format, parseISO, addDays, subDays, isToday, isYesterday } from "date-fns";

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

/**
 * Date Navigation Component
 * 
 * Provides date selection and navigation controls for the Daily Diary.
 * Designed for easy customization and future enhancements.
 * 
 * @future-enhancements:
 * - Calendar popup selector
 * - Date range selection
 * - Jump to date shortcut
 * - Keyboard navigation (Arrow keys)
 * - Preset buttons (Today, Yesterday, This Week, etc.)
 * - URL sync for deep linking
 */
export function DateNavigation({ selectedDate, onDateChange }: DateNavigationProps) {
  const navigateDate = (direction: "prev" | "next") => {
    const newDate = direction === "prev" 
      ? subDays(selectedDate, 1) 
      : addDays(selectedDate, 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarDays className="w-5 h-5" />
            <span>{getDateLabel(selectedDate)}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {/* Previous Day */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate("prev")}
              aria-label="Previous day"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            {/* Date Input */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                {/* <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70 pointer-events-none z-10" /> */}
                <Input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => {
                    if (e.target.value) {
                      try {
                        onDateChange(parseISO(e.target.value));
                      } catch (err) {
                        console.error("Invalid date:", err);
                      }
                    }
                  }}
                  className="w-40 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:mr-1 dark:[color-scheme:dark] cursor-pointer"
                  aria-label="Select date"
                />
              </div>
              
              {/* Quick "Today" button - only show if not today */}
              {!isToday(selectedDate) && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={goToToday}
                  aria-label="Go to today"
                >
                  Today
                </Button>
              )}
            </div>

            {/* Next Day */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate("next")}
              aria-label="Next day"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

