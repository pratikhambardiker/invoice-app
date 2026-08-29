import { STATUS_LABEL } from "@/lib/status";
import type { DisplayStatus } from "@/lib/types";

const styles: Record<DisplayStatus, string> = {
  draft: "bg-[#EFECE4] text-[#5C574F]",
  sent: "bg-[#E4EBF3] text-[#2F4A66]",
  paid: "bg-[#E4EDE8] text-[#1F433A]",
  overdue: "bg-[#F6E6E2] text-[#8C3A2C]",
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
