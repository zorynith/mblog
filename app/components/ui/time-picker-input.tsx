import * as React from "react";
import { Input } from "./input";
import { cn } from "~/lib/utils";

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: Date;
  onChange?: (date: Date) => void;
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const time = value ? new Date(value).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    }) : "";

    return (
      <Input
        type="time"
        ref={ref}
        value={time}
        onChange={(e) => {
          if (onChange && e.target.value) {
            const [hours, minutes] = e.target.value.split(':');
            const newDate = new Date(value || new Date());
            newDate.setHours(parseInt(hours));
            newDate.setMinutes(parseInt(minutes));
            onChange(newDate);
          }
        }}
        className={cn(
          "w-full",
          className
        )}
        {...props}
      />
    );
  }
);

TimePickerInput.displayName = "TimePickerInput";

export { TimePickerInput }; 