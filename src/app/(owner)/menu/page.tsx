import { sampleMenu } from "@/lib/sampleData";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OwnerMenuPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">Owner view</p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Menu manager</h1>
          <p className="text-sm text-[var(--muted)]">Toggle availability and pricing (static demo)</p>
        </div>
        <Button variant="soft" size="sm">
          Add item
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {sampleMenu.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-2xl border border-[var(--border)] bg-white/80 p-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-base font-semibold text-[#2c2218]">{item.name}</p>
              <p className="text-sm text-[var(--muted)]">{item.description}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge tone="neutral">{item.category}</Badge>
                {item.tags?.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-base font-semibold text-[#3f5d45]">
                {formatCurrency(item.price)}
              </p>
              <Button variant="outline" size="sm">
                Toggle availability
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

