# YumYard – QR/table + delivery ordering

Mobile-first ordering for dine-in and delivery with live kitchen status and an owner dashboard. Built with Next.js App Router, TypeScript, Tailwind (v4), Convex schema, Zustand, and Sonner.

## App surfaces
- Landing: `app/page.tsx`
- Customer menu + cart + checkout (QR/table aware): `app/(customer)/menu/page.tsx`
- Customer order tracking: `app/(customer)/order/[orderId]/page.tsx`
- Owner dashboard: `app/(owner)/dashboard/page.tsx`
- Owner menu manager: `app/(owner)/menu/page.tsx`
- QR previews: `app/qr/page.tsx`

## Running locally
```bash
pnpm install
pnpm dev
# open http://localhost:3000
```

## Environment
- `NEXT_PUBLIC_UPI_ID` – UPI VPA used to build intent URLs (e.g., `yourupi@bank`).
- Optional: configure Convex if you deploy backend; schema lives in `convex/schema.ts`.

## Notes
- Menu, orders, and tables are seeded from `src/lib/sampleData.ts` for UI demo.
- Cart and checkout state live in `zustand` (`src/stores/cart.ts`).
- Payments: BHIM UPI intent link or COD choice in cart drawer; order ID echoed in UPI note.
- QR flow: add `?tableId=T1` to `menu` to prefill table and skip address.

## Deploy
- Vercel recommended for the Next.js front-end.
- Convex Cloud recommended for realtime order storage; run `npm run convex:codegen` after setting up a Convex project and auth.
