"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/components/ui/utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-6",
        month: "flex flex-col gap-4 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-6 border-2 border-blue-100",
        caption: "flex justify-center pt-1 relative items-center w-full mb-4",
        caption_label: "text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-9 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-0 hover:from-blue-600 hover:to-blue-700 rounded-full border-0 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse mt-2",
        head_row: "flex gap-1 mb-2",
        head_cell:
          "text-blue-600 rounded-lg w-11 font-bold text-sm uppercase tracking-wide",
        row: "flex w-full mt-1 gap-1",
        cell: cn(
          "relative p-0 text-center focus-within:relative focus-within:z-20 transition-all duration-200",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-xl [&:has(>.day-range-start)]:rounded-l-xl first:[&:has([aria-selected])]:rounded-l-xl last:[&:has([aria-selected])]:rounded-r-xl [&:has([aria-selected])]:bg-blue-100"
            : "[&:has([aria-selected])]:bg-transparent",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-11 p-0 font-semibold aria-selected:opacity-100 rounded-xl text-gray-700 hover:bg-blue-100 hover:text-blue-700 hover:border-2 hover:border-blue-300 transition-all duration-200 hover:scale-105",
        ),
        day_range_start:
          "day-range-start aria-selected:bg-gradient-to-r aria-selected:from-blue-600 aria-selected:to-blue-700 aria-selected:text-white aria-selected:shadow-lg",
        day_range_end:
          "day-range-end aria-selected:bg-gradient-to-r aria-selected:from-blue-600 aria-selected:to-blue-700 aria-selected:text-white aria-selected:shadow-lg",
        day_selected:
          "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:text-white focus:from-blue-700 focus:to-indigo-700 focus:text-white shadow-lg hover:shadow-xl font-bold",
        day_today: "bg-blue-50 text-blue-700 font-bold border-2 border-blue-400 shadow-sm",
        day_outside:
          "day-outside text-gray-300 opacity-50 aria-selected:text-blue-300",
        day_disabled: "text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent",
        day_range_middle:
          "aria-selected:bg-blue-100 aria-selected:text-blue-700 aria-selected:font-semibold",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props: { className?: string; size?: number; disabled?: boolean; orientation?: "up" | "down" | "left" | "right" }) => {
          const { orientation = "left", className, ...rest } = props;
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon className={cn("size-5", className)} {...rest} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };