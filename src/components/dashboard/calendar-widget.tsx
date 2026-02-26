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

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

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

type DotColor = "red" | "amber" | "slate";

const DOT_PRIORITY: Record<DotColor, number> = { red: 0, amber: 1, slate: 2 };

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
        color = "red";
      } else if (diff >= 0 && diff < thirtyDaysMs) {
        color = "amber";
      } else {
        color = "slate";
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
    <div className="h-full rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
          <CalendarDays className="h-4 w-4 text-slate-600" aria-hidden="true" />
        </div>
        <div className="flex-1 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-900">Upcoming Schedule</h3>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{MONTH_NAMES[month]} {year}</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_HEADERS.map((h, i) => (
            <div
              key={i}
              className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              {h}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`pad-${idx}`} className="p-1" />;
            }
            const isToday = day === todayDate;
            const dotColor = dotMap.get(day);

            return (
              <div
                key={`day-${day}`}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg p-1 min-h-[2.5rem]",
                  isToday && "bg-blue-50 border border-blue-100"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium z-10",
                    isToday ? "text-blue-700" : "text-slate-700"
                  )}
                >
                  {day}
                </span>

                {/* Event Dot */}
                {dotColor && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1.5 w-1.5 rounded-full z-10",
                      dotColor === "red" && "bg-red-500",
                      dotColor === "amber" && "bg-amber-500",
                      dotColor === "slate" && "bg-slate-400"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-medium text-slate-500">
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> &lt; 7 Days</div>
          <div className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> &lt; 30 Days</div>
      </div>
    </div>
  );
}
