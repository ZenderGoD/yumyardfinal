import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/format";

type Props = {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
};

export function MenuCard({ item, onAdd }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm">
      {item.image ? (
        <div className="relative h-36 w-full overflow-hidden rounded-xl bg-[var(--accent-soft)]">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>
      ) : (
        <div className="h-36 rounded-xl bg-[var(--accent-soft)]" />
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-[#2c2218]">{item.name}</p>
            <p className="text-sm text-[var(--muted)] line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="text-sm font-semibold text-[#3f5d45]">
            {formatCurrency(item.price)}
          </div>
        </div>
        {item.tags && (
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} tone="neutral">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Button size="sm" onClick={() => onAdd(item)}>
        Add to cart
      </Button>
    </div>
  );
}

