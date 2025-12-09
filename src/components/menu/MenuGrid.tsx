import { MenuItem } from "@/lib/types";
import { MenuCard } from "./MenuCard";

type Props = {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
};

export function MenuGrid({ items, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}

