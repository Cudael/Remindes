import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarWidgetProps {
  /** Items that have an expirationDate or renewalDate */
  items: {
    id: string;
    name: string;
    expirationDate: Date | null;
    renewalDate: Date | null;
  }[];
  /** The current date (passed from the server so SSR is deterministic) */
  today: Date;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type DotColor = "rose" | "amber" | "teal";

const DOT_PRIORITY: Record<DotColor, number> = { rose: 0, amber: 1, teal: 2 };

export function CalendarWidget({ items, today }: CalendarWidgetProps) {
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Normalise today to midnight for accurate diff calculations
  const todayMidnight = new Date(year, month, todayDate).getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  // Build a map: day-of-month → highest-priority dot colour
  const dotMap = new Map<number, DotColor>();

  for (const item of items) {
    const dates = [item.expirationDate, item.renewalDate].filter(
      (d): d is Date => d !== null
    );
    for (const date of dates) {
      const d = new Date(date);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;

      const day = d.getDate();
      const diff =
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
        todayMidnight;

      let color: DotColor;
      if (diff >= 0 && diff < sevenDaysMs) {
        color = "rose";
      } else if (diff >= 0 && diff < thirtyDaysMs) {
        color = "amber";
      } else {
        color = "teal";
      }

      const existing = dotMap.get(day);
      if (existing === undefined || DOT_PRIORITY[color] < DOT_PRIORITY[existing]) {
        dotMap.set(day, color);
      }
    }
  }

  // Cells: leading nulls for padding + 1-based day numbers
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to a full week row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="h-full rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-white/5 p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20">
          <CalendarDays className="h-4 w-4 text-teal-400" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-white">
          {MONTH_NAMES[month]} {year}
        </h3>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-slate-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 flex-1">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`pad-${i}`} aria-hidden="true" />;
          }

          const isToday = day === todayDate;
          const dotColor = dotMap.get(day);

          return (
            <div key={day} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isToday
                    ? "bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/50"
                    : "text-slate-400"
                )}
                aria-current={isToday ? "date" : undefined}
              >
                {day}
              </span>
              {dotColor !== undefined && (
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    dotColor === "rose" && "bg-rose-400",
                    dotColor === "amber" && "bg-amber-400",
                    dotColor === "teal" && "bg-teal-400"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
