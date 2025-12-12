'use client';

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/stores/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";

type NewItemForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  tags: string;
  image: string;
  imageStorageId?: Id<"_storage">;
  dealPrice: string;
  dealMinutes: string;
  comboItems: string;
};

export default function KitchenMenuPage() {
  const { customer, isAdmin } = useAuth();
  const router = useRouter();
  const itemsQuery = useQuery(api.menu.list);
  const items = useMemo(() => itemsQuery ?? [], [itemsQuery]);
  const createItem = useMutation(api.menu.create);
  const updateItem = useMutation(api.menu.update);
  const removeItem = useMutation(api.menu.remove);
  const toggleAvailability = useMutation(api.menu.toggleAvailability);
  const getUploadUrl = useMutation(api.menu.getUploadUrl);

  const [form, setForm] = useState<NewItemForm>({
    name: "",
    description: "",
    price: "",
    category: "",
    tags: "",
    image: "",
    imageStorageId: undefined,
    dealPrice: "",
    dealMinutes: "",
    comboItems: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>("");
  const [editingDescription, setEditingDescription] = useState<string>("");
  const [uploadingNew, setUploadingNew] = useState(false);
  const [uploadingEditId, setUploadingEditId] = useState<string | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<Record<string, string | null>>({});

  const hasAccess = customer && isAdmin;

  const sortedItems = useMemo(
    () =>
      items.slice().sort((a, b) => {
        const availA = a.available ?? true;
        const availB = b.available ?? true;
        if (availA !== availB) return availA ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    [items],
  );

  if (!hasAccess) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 space-y-3">
        <h1 className="text-2xl font-bold text-[#2c2218]">Kitchen menu</h1>
        <p className="text-sm text-muted">Admin access required. Sign in with an admin email.</p>
        <Button onClick={() => router.push("/kitchen")}>Back to kitchen</Button>
      </div>
    );
  }

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    const price = Number(form.price);
    if (Number.isNaN(price)) {
      alert("Enter a valid price");
      return;
    }
    const dealPrice = form.dealPrice ? Number(form.dealPrice) : undefined;
    if (form.dealPrice && Number.isNaN(dealPrice)) {
      alert("Enter a valid deal price");
      return;
    }
    const dealMinutes = form.dealMinutes ? Number(form.dealMinutes) : undefined;
    if (form.dealMinutes && Number.isNaN(dealMinutes)) {
      alert("Enter valid deal minutes");
      return;
    }
    const dealExpiresAt = dealMinutes ? Date.now() + dealMinutes * 60_000 : undefined;

    await createItem({
      name: form.name,
      description: form.description,
      price,
      category: form.category || "General",
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
      image: form.image || undefined,
      imageStorageId: form.imageStorageId,
      available: true,
      dealPrice,
      dealExpiresAt,
      comboItems: form.comboItems ? form.comboItems.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
    });

    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      tags: "",
      image: "",
      imageStorageId: undefined,
      dealPrice: "",
      dealMinutes: "",
      comboItems: "",
    });
    setNewImagePreview(null);
  };

  const startEdit = (id: Id<"menu">, price: number, description: string) => {
    setEditingId(id);
    setEditingPrice(String(price));
    setEditingDescription(description);
  };

  const saveEdit = async (id: Id<"menu">) => {
    const price = Number(editingPrice);
    if (Number.isNaN(price)) {
      alert("Enter a valid price");
      return;
    }
    await updateItem({ id, price, description: editingDescription });
    setEditingId(null);
    setEditingPrice("");
    setEditingDescription("");
  };

  const uploadImage = async (
    file: File,
    onUploaded: (storageId: Id<"_storage">, previewUrl: string) => void,
    setBusy: (flag: boolean) => void,
  ) => {
    setBusy(true);
    try {
      const { uploadUrl } = await getUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const json = await res.json();
      const storageId = json.storageId as Id<"_storage">;
      const preview = URL.createObjectURL(file);
      onUploaded(storageId, preview);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted">Kitchen</p>
          <h1 className="text-2xl font-bold text-[#2c2218]">Menu management</h1>
          <p className="text-sm text-muted">Add, edit, and toggle availability. Combos and deals supported.</p>
        </div>
        <Link href="/kitchen" className="text-sm font-semibold text-accent underline">
          ← Back to kitchen
        </Link>
      </div>

      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-border bg-white/85 p-4 shadow-sm space-y-3"
      >
        <h2 className="text-sm font-semibold text-[#2c2218]">Add new item</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Coffee, Brunch, Dessert"
            required
          />
          <Input
            label="Price (₹)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            required
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#3f3225]">Image</label>
            <div className="rounded-xl border border-dashed border-border bg-white/70 p-3">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById("new-image-input")?.click()}
                  disabled={uploadingNew}
                >
                  {uploadingNew ? "Uploading..." : "Upload"}
                </Button>
                <input
                  id="new-image-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    await uploadImage(
                      file,
                      (storageId, previewUrl) => {
                        setForm((f) => ({ ...f, imageStorageId: storageId, image: "" } as NewItemForm));
                        setNewImagePreview(previewUrl);
                      },
                      setUploadingNew,
                    );
                  }}
                />
                <div className="flex-1 text-xs text-muted">
                  Drag & drop or upload a photo (JPG/PNG).
                </div>
              </div>
              {newImagePreview ? (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newImagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
        />
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Tags (comma-separated)"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="vegan, spicy"
          />
          <Input
            label="Combo items (comma-separated)"
            value={form.comboItems}
            onChange={(e) => setForm((f) => ({ ...f, comboItems: e.target.value }))}
            placeholder="Coffee, Croissant"
          />
          <Input
            label="Deal price (₹)"
            value={form.dealPrice}
            onChange={(e) => setForm((f) => ({ ...f, dealPrice: e.target.value }))}
            placeholder="Optional"
          />
          <Input
            label="Deal duration (minutes)"
            value={form.dealMinutes}
            onChange={(e) => setForm((f) => ({ ...f, dealMinutes: e.target.value }))}
            placeholder="Optional"
          />
        </div>
        <Button type="submit">Add item</Button>
      </form>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#2c2218]">Current menu</h2>
        {sortedItems.map((item) => {
          const isEditing = editingId === item.id;
          const itemId = item.id as Id<"menu">;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-white p-3 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-accent-soft">
                  {item.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted">No image</div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-[#2c2218]">{item.name}</p>
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        item.available ?? true ? "bg-accent-soft text-accent" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.available ?? true ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {item.category} · ₹{item.price}
                    {item.dealPrice ? ` · Deal ₹${item.dealPrice}` : ""}
                  </p>
                  {item.dealExpiresAt ? (
                    <p className="text-[11px] text-muted">
                      Deal until {new Date(item.dealExpiresAt).toLocaleString()}
                    </p>
                  ) : null}
                  <p className="text-xs text-muted line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-muted">
                    {item.comboItems?.length ? <span>Combo: {item.comboItems.join(", ")}</span> : null}
                    {item.tags?.length ? <span>Tags: {item.tags.join(", ")}</span> : null}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    toggleAvailability({
                      id: itemId,
                      available: !(item.available ?? true),
                    })
                  }
                >
                  {item.available ?? true ? "Mark unavailable" : "Mark available"}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => startEdit(itemId, item.price, item.description)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete ${item.name}?`)) {
                      removeItem({ id: itemId });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>

              {isEditing ? (
                <div className="w-full space-y-2 rounded-xl border border-border bg-white p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Edit item</p>
                  <Input
                    label="Price (₹)"
                    value={editingPrice}
                    onChange={(e) => setEditingPrice(e.target.value)}
                  />
                  <Textarea
                    label="Description"
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await uploadImage(
                          file,
                          async (storageId, previewUrl) => {
                            setEditImagePreview((prev) => ({ ...prev, [item.id]: previewUrl }));
                            await updateItem({
                              id: item.id as Id<"menu">,
                              imageStorageId: storageId,
                              image: undefined,
                            });
                          },
                          (flag) => setUploadingEditId(flag ? item.id : null),
                        );
                      }}
                    />
                    {uploadingEditId === item.id ? (
                      <span className="text-xs text-muted">Uploading...</span>
                    ) : editImagePreview[item.id] ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editImagePreview[item.id] ?? ""}
                          alt="Preview"
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(itemId)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
        {!sortedItems.length && (
          <div className="rounded-2xl border border-border bg-white/80 p-4 text-sm text-muted">
            No items yet. Add your first menu item above.
          </div>
        )}
      </div>
    </div>
  );
}



