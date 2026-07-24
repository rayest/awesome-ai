"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3 } from "lucide-react";
import { format, isValid, parse } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectControl } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  value: String(hour).padStart(2, "0"),
  label: `${String(hour).padStart(2, "0")} 时`,
}));

const MINUTES = Array.from({ length: 12 }, (_, index) => {
  const minute = String(index * 5).padStart(2, "0");
  return { value: minute, label: `${minute} 分` };
});

function parseValue(value: string, withTime: boolean) {
  if (!value) return undefined;
  const parsed = parse(
    value,
    withTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd",
    new Date(),
  );
  return isValid(parsed) ? parsed : undefined;
}

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  min?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function DatePicker({
  value,
  onChange,
  withTime = false,
  min,
  placeholder,
  disabled,
  required,
  className,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => parseValue(value, withTime), [value, withTime]);
  const minDate = useMemo(
    () => (min ? parseValue(min, min.includes("T")) : undefined),
    [min],
  );
  const hour = selected ? format(selected, "HH") : "09";
  const minute = selected
    ? String(Math.round(Number(format(selected, "mm")) / 5) * 5 % 60).padStart(2, "0")
    : "00";

  function commit(date: Date, nextHour = hour, nextMinute = minute) {
    const next = new Date(date);
    next.setHours(Number(nextHour), Number(nextMinute), 0, 0);
    onChange(format(next, withTime ? "yyyy-MM-dd'T'HH:mm" : "yyyy-MM-dd"));
  }

  const display = selected
    ? format(selected, withTime ? "yyyy年M月d日 HH:mm" : "yyyy年M月d日", {
        locale: zhCN,
      })
    : placeholder ?? (withTime ? "选择日期和时间" : "选择日期");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-required={required}
          className={cn(
            "h-9 w-full justify-between px-3 text-left font-normal",
            !selected && "text-[var(--ink-mute)]",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2 truncate">
            {withTime ? (
              <Clock3 data-icon="inline-start" aria-hidden="true" />
            ) : (
              <CalendarDays data-icon="inline-start" aria-hidden="true" />
            )}
            <span className="truncate">{display}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="overflow-hidden p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (!date) return;
            commit(date);
            if (!withTime) setOpen(false);
          }}
          disabled={minDate ? { before: minDate } : undefined}
          locale={zhCN}
        />
        {withTime ? (
          <div className="flex items-center gap-2 border-t border-[var(--hairline)] p-3">
            <SelectControl
              value={hour}
              onValueChange={(nextHour) => commit(selected ?? new Date(), nextHour, minute)}
              options={HOURS}
              aria-label="小时"
              className="w-[112px]"
            />
            <SelectControl
              value={minute}
              onValueChange={(nextMinute) => commit(selected ?? new Date(), hour, nextMinute)}
              options={MINUTES}
              aria-label="分钟"
              className="w-[112px]"
            />
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              确定
            </Button>
          </div>
        ) : selected && !required ? (
          <div className="flex justify-end border-t border-[var(--hairline)] p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              清除日期
            </Button>
          </div>
        ) : null}
        {withTime && selected && !required ? (
          <div className="flex justify-end border-t border-[var(--hairline)] px-3 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              清除日期时间
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
