# WP Ornaments — 3D jewellery store

Next.js 15 + React Three Fiber + Supabase + Razorpay.

Customers can browse, view pieces in 3D, filter, wishlist and fill a bag without an account. They only sign in (email code or Google) to check out, send a custom design request, or see their orders.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # pricing + Razorpay signature tests
```

If no Supabase keys are set, the site runs in **local demo mode**. Data is saved to `.data/demo-db.json`, and two test logins (admin + customer) are generated into `DEMO_ACCOUNTS.md`. Both are gitignored, and demo login is disabled in production. Delete `.data/` to reset and get new passwords.

## Booking mode vs online payments
Go to Admin → **Store settings** → **Online payments**.
- **OFF (default):** checkout becomes "Book / Enquire". The customer sends contact details, a preferred call time and a note. The booking shows in Admin → Orders & bookings with a WhatsApp button, and you move it booked → confirmed → crafting → ready → delivered.
- **ON:** checkout charges through Razorpay (requires the Razorpay keys).

## Go live

1. Create a Supabase project. In the SQL editor, run `supabase/schema.sql`, then `supabase/seed.sql`.
2. In Auth → Providers, enable Email (OTP) and optionally Google. Add `https://your-domain/auth/callback` to the redirect URLs.
3. Sign in on the site once, then make that account an admin:
   `update profiles set role='admin' where id=(select id from auth.users where email='owner@example.com');`
4. Copy `.env.example` to `.env.local` and fill in the Supabase URL, anon key, service-role key and the Razorpay key id and secret. Start with Razorpay **test** keys.
5. Deploy to Vercel with the same env vars.

## Admin (`/admin`)
- Products: add/edit/delete, upload photos and an optional real `.glb` 3D model. Without a `.glb`, the procedural model for the category is shown.
- Metal rates: set ₹/g for 22K, 18K and 925. Every price recalculates as weight × rate + making % + 3% GST.
- Orders: update status (paid → crafting → shipped → delivered). The customer sees a timeline.
- Custom requests: view the 3D configuration and reference images, then send a quote and a note. The customer accepts or declines from their account.

## 3D
- There is one shared WebGL canvas for the whole site (`components/three/SceneRoot.tsx`). Every 3D slot is a drei `<View>`, so scrolling never reloads anything.
- Lighting comes from the studio HDRI `public/hdri/studio.hdr` (Poly Haven "Studio Small 09", CC0).
- Diamonds and gems are faceted cuts with ray-traced refraction. Metals use measured PBR colours.
- Uploading a real `.glb` for a product in Admin replaces the procedural model.

## Notifications
New bookings and custom requests are emailed to the shop through Web3Forms. Set `WEB3FORMS_KEY` in `.env.local` to the shop's Web3Forms access key (get one free at web3forms.com). Without it, the site works but sends no emails.

## Before launch
- Fill in the real showroom address, hours and map link in `lib/site.ts`, and set `NEXT_PUBLIC_SITE_URL`.
- Review the template policies in `app/policies/[slug]/page.tsx`. Razorpay requires these pages.

## Where things live
- `components/three/models.tsx` holds the procedural ring, bangle, chain, bracelet, pendant, jhumka, necklace and mangalsutra models.
- `lib/price.ts` has the single pricing formula, which the server recomputes at checkout.
- `app/api/razorpay/*` creates orders server-side and verifies payment signatures.
- `middleware.ts` handles the login gate for `/checkout`, `/account`, `/order` and `/admin`.
