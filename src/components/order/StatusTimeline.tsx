import { orderStatusMeta, statusFlow, statusProgressIndex } from "@/lib/status";
import { OrderStatus } from "@/lib/types";
import clsx from "clsx";
import { formatTime } from "@/lib/format";

type History = { status: OrderStatus; at: number; note?: string };

type Props = {
  current: OrderStatus;
  history: History[];
};

export function StatusTimeline({ current, history }: Props) {
  const currentIndex = statusProgressIndex(current);
  return (
    <div className="relative grid gap-4">
      {statusFlow.map((status, idx) => {
        const meta = orderStatusMeta[status];
        const record = history.find((h) => h.status === status);
        const isDone = idx <= currentIndex;
        return (
          <div key={status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={clsx(
                  "mt-1 h-3 w-3 rounded-full",
                  isDone ? "bg-[var(--accent)]" : "bg-[var(--border)]",
                )}
              />
              {idx !== statusFlow.length - 1 && (
                <span
                  className={clsx(
                    "flex-1 w-[2px]",
                    isDone ? "bg-[var(--accent-soft)]" : "bg-[var(--border)]",
                  )}
                />
              )}
            </div>
            <div className="flex-1 rounded-xl border border-[var(--border)] bg-white/80 p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-[#2c2218]">
                  {meta.label}
                </p>
                {record?.at && (
                  <span className="text-xs text-[var(--muted)]">
                    {formatTime(record.at)}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--muted)]">{meta.description}</p>
              {record?.note && (
                <p className="mt-1 text-xs font-medium text-[#3f5d45]">
                  {record.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

