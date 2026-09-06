# Everword

The Everword storefront, built on [Shopify Horizon](https://github.com/Shopify/horizon).

Converted from `everword-v94-standalone.html` — a 19.3 MB single-file build that
rendered the whole shop client-side from hash routes, with every image, the hero
film, the catalogue and all 65 content pages inlined as base64 and JavaScript.

## How it maps

| The standalone build | Here |
|---|---|
| `#home` view | `templates/index.json` — film hero, occasion doors, shelf, about band, promises |
| `#shop` view + JS filters | `templates/collection.json` with Shopify's native storefront filters |
| `#p/<slug>` view | `templates/product.json`, using Horizon's variant picker and cart |
| `#d/<slug>` views (65 of them) | Shopify pages and blog articles — see `everword-data/` |
| The seven-panel mega menu | `sections/everword-header.liquid`, driven by a Shopify menu |
| `window.__P` (30 products) | **not carried over** — ShineOn's app supplies the catalogue |
| Design imagery from the inline base64 | 43 files in `assets/` |
| `window.__SHIP` / `__EXP` | Settings on the Everword product details block |
| `window.__PDPX` per-product copy | `everword.*` product metafields |
| `CARDS` phrase bank | `assets/everword-cards.json` |

## Getting it running

1. Upload `everword-horizon-theme.zip` under Online Store → Themes → Add theme.
2. Import your products with ShineOn's app. The theme ships with no catalogue.
3. Build the menus under Content → Menus. The header menu wants **three levels**:
   top level opens a mega panel, second level are its column headings, third
   level the links inside them. Point third-level links at collections and they
   borrow those collections' images for their thumbnails.
4. In the theme editor, set the personalisation block on the product template —
   which field, its label, how many characters.
5. Create collections to feed the home page's occasion doors and its shelf. The
   doors, the about band and the hero all ship with the source's own photographs
   as fallbacks, so they look right before you pick anything.
6. Create a page with the handle `wishlist` and give it the **page.wishlist**
   template, so the masthead heart has somewhere to go.
7. Optionally import the writing from `everword-data/` — 38 pages and 27
   articles, none of which comes from ShineOn.

## Things worth knowing

**The palette is light, not dark.** The source stylesheet defines `:root` twice.
The second block supersedes the first and inverts the scheme without renaming
the variables, so `--ink` is the warm-white page ground (`#FCFBF8`) and `--cream`
is the near-black text (`#211C1A`). The names are kept as-is throughout so the
1200 lines of ported CSS did not have to be rewritten — but read them as
historical, not descriptive.

**Body copy is Jost.** The source asked for it and never loaded it, so it had
been falling back to whatever sans the visitor's OS supplies — different on
every device. It is loaded properly now. If you preferred the old look, change
the body font in Theme settings → Typography.

**Personalisation is configured on the block, not per product.** ShineOn's
import will not carry Everword metafields, so the personalisation and message
card blocks take their settings from the theme editor and treat metafields as a
per-product override. Set it once on the product template and it applies to
everything; add a metafield only where a piece needs to differ.

**Personalisation clamping is deliberate.** `assets/everword-personalisation.js`
folds text to ASCII before it cuts it, because ShineOn cannot cut accents or
emoji and an unsupported character holds the order. "José" becomes "Jose"
rather than losing its last letter. `maxlength` alone is not enough: it ignores
script-set values and counts UTF-16 units, so an emoji costs two and can be cut
in half. Spaces are blocked on name fields — a product decision, not a supplier
rule; set `data-block-spaces="false"` to allow them again.

**Options versus properties.** Finish, box and size arrive from ShineOn as
ordinary variant options and price themselves. Personalisation text and the
message card are line item properties instead, so they reach the order without
multiplying variants.

**The wishlist, and what a theme can honestly promise.** A Shopify theme cannot
write customer data — there is no storefront API for setting a customer
metafield — so no theme-only wishlist truly follows a signed-in customer. This
one is built so both cases work and the second is a setting rather than a
rewrite:

- Everyone gets a wishlist straight away, kept in their browser.
- A signed-in customer's saved list is read server-side from the
  `everword.wishlist` customer metafield, so anything an app, Flow or the admin
  writes there shows up.
- Set **Sync endpoint** in Theme settings → Wishlist to an app proxy path (say
  `/apps/everword/wishlist`) and that becomes the source of truth across
  devices. It should answer `GET` with `{"wishlist":["handle"]}` and accept the
  same shape on `POST`. Being a proxy, it is same-origin and carries the
  customer's session, so it knows who is asking.

Local and remote lists are merged as a union, never replaced, so signing in on a
new device does not discard what was saved before signing in. A product that has
since been unpublished drops off the list rather than sitting there dead.

**The sticky buy bar is Horizon's**, not a custom one. Horizon already ships a
sticky add-to-cart that tracks the selected variant and shares the product form;
running a second bar alongside it was duplication. What it needed was for this
theme's full-width add-to-cart rule to be held back inside it — stretching that
button squeezed the title and price column until the text overlapped — and then
Everword's shapes and type applied.

**The gallery** is one hero image with a thumbnail rail down its left. Horizon
supports that natively (carousel presentation, thumbnails, left position), so it
is configured in `templates/product.json` rather than rebuilt.

**The message card is built but not placed.** `blocks/everword-message-card`
still exists with its phrase bank; add it to the product template in the theme
editor to switch it back on.

**Everything on the product form, cart and drawers is Horizon's, restyled.**
`assets/everword-shopify.css` reaches into Horizon's own components rather than
replacing them, because those components carry the cart logic. It loads last, so
it wins on order rather than on specificity wars.

Two things it fixes rather than decorates. Horizon's buttons are
`width: fit-content`, which on a column of full-width fields makes add-to-cart
read as a mistake. And line item properties are set to be legible rather than
tucked into fine print — on a personalised order the customer reading back what
they typed before they pay is the whole ballgame.

**The email capture** is in the footer group, off `sections/everword-optin.liquid`.
It waits (12s, or 35% scroll, or exit intent — whichever comes first), asks for
one field, never appears over the cart or checkout or a signed-in customer,
remembers a dismissal for 14 days and a signup for a year, traps focus and
closes on Escape. Exit intent is desktop-only on purpose: pointing at the tab
bar has no touch equivalent, and the mobile approximations fire during ordinary
browsing and read as a trap.

**The hero film.** `assets/ew-hero-film.mp4` and `.webm` ship with the theme, but
Shopify's asset directory does not reliably accept video. If the upload strips
them, put them in Content → Files and paste the URLs into the film hero section's
settings — it reads them from there.

**The promise row was rebuilt, not ported.** The source hung it off a 112px top
margin and put its rules on an inner element at content width, so four short
labels floated in a lot of air between two lines that aligned with nothing. The
rules now belong to the section, so they read as its edges, and the spacing,
row height, icon size and whether the rules run full width are all settings.

**Dead CSS was left alone.** The stylesheet still carries rules for `.news`,
`.who`, `.band`, `.occ` and `.tiles`. No v94 markup uses any of them, so they are
earlier versions left behind; no sections were built for them.

## What was not carried over

**The catalogue.** No products, and no product photography — ShineOn supplies
both. Only the 43 design images the sections need are bundled: the hero poster
and film, the occasion doors, the about band, and the editorial shots.

Horizon's cart drawer and predictive search are reused rather than rebuilt —
the masthead calls both — because they already work and are accessible.

## Licence

Horizon is licensed by Shopify for building themes that run on Shopify. That
permits this store's own use and delivery to a merchant as a service engagement.
It does **not** permit submitting a Horizon-derived theme to the Shopify Theme
Store, or reselling or redistributing it. See `LICENSE.md`.
