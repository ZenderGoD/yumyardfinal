import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/format";
import { useMemo, useState } from "react";

type Props = {
  item: MenuItem;
  onAdd: (item: MenuItem, addOnIds?: string[], note?: string) => void;
};

export function MenuCard({ item, onAdd }: Props) {
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const hasAddOns = (item.addOns?.length ?? 0) > 0;

  const addOnMap = useMemo(() => {
    const map = new Map<string, { name: string; price: number }>();
    item.addOns?.forEach((a) => map.set(a.id, { name: a.name, price: a.price }));
    return map;
  }, [item.addOns]);

  const addOnTotal = selectedAddOns.reduce((acc, id) => acc + (addOnMap.get(id)?.price ?? 0), 0);
  const totalPrice = item.price + addOnTotal;

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-white/80 p-4 shadow-sm transition hover:-translate-y-px hover:shadow-md">
      {item.image ? (
        <div className="relative h-36 w-full overflow-hidden rounded-xl bg-accent-soft">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>
      ) : (
        <div className="h-36 rounded-xl bg-accent-soft" />
      )}
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-base font-semibold text-[#2c2218]">{item.name}</p>
            <p className="text-sm text-muted line-clamp-2">
              {item.description}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#3f5d45]">{formatCurrency(totalPrice)}</p>
            {hasAddOns ? (
              <p className="text-[11px] text-muted">
                Base {formatCurrency(item.price)}
              </p>
            ) : null}
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
      <div className="flex items-center justify-between gap-2">
        {hasAddOns ? (
          <button
            type="button"
            onClick={() => setShowOptions((prev) => !prev)}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-accent hover:border-accent hover:bg-accent-soft"
          >
            {showOptions ? "Hide options" : `${item.addOns?.length ?? 0} options`}
          </button>
        ) : (
          <span className="text-xs text-muted">No add-ons</span>
        )}
        <Button
          size="sm"
          onClick={() => {
            onAdd(item, selectedAddOns, note);
            setNote("");
            setSelectedAddOns([]);
            setShowOptions(false);
          }}
        >
          Add{hasAddOns ? " +" : ""}
        </Button>
      </div>

      {hasAddOns && showOptions ? (
        <div className="space-y-2 rounded-xl border border-border bg-accent-soft/50 p-3">
          <p className="text-xs font-semibold text-[#3f3225]">Customize</p>
          <div className="flex flex-wrap gap-2">
            {item.addOns?.map((addOn) => (
              <button
                key={addOn.id}
                onClick={() => toggleAddOn(addOn.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  selectedAddOns.includes(addOn.id)
                    ? "border-accent bg-white text-accent shadow"
                    : "border-border text-[#3f3225]"
                }`}
              >
                {addOn.name} · {formatCurrency(addOn.price)}
              </button>
            ))}
          </div>
          <textarea
            placeholder="Notes (no sugar, extra crispy, etc.)"
            className="w-full rounded-xl border border-border bg-white px-3 py-2 text-xs outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Extras total</span>
            <span className="font-semibold text-[#3f5d45]">
              {formatCurrency(addOnTotal)}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

