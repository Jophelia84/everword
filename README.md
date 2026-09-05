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
5. Create collections to feed the home page's occasion doors and its shelf, and
   pick images for the doors, the about band and the hero.
6. Optionally import the writing from `everword-data/` — 38 pages and 27
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

**The hero film.** `assets/ew-hero-film.mp4` and `.webm` ship with the theme, but
Shopify's asset directory does not reliably accept video. If the upload strips
them, put them in Content → Files and paste the URLs into the film hero section's
settings — it reads them from there.

**Dead CSS was left alone.** The stylesheet still carries rules for `.news`,
`.who`, `.band`, `.occ` and `.tiles`. No v94 markup uses any of them, so they are
earlier versions left behind; no sections were built for them.

## What was not carried over

**The catalogue.** No products, and no product photography — ShineOn supplies
both. Only the 43 design images the sections need are bundled: the hero poster
and film, the occasion doors, the about band, and the editorial shots.

**The wishlist.** The source kept it in browser storage, which does not survive
a device change and cannot be read back by the store. It wants a customer
account or an app rather than a reimplementation, so it was left out.

Horizon's cart drawer and predictive search are reused rather than rebuilt —
the masthead calls both — because they already work and are accessible.

## Licence

Horizon is licensed by Shopify for building themes that run on Shopify. That
permits this store's own use and delivery to a merchant as a service engagement.
It does **not** permit submitting a Horizon-derived theme to the Shopify Theme
Store, or reselling or redistributing it. See `LICENSE.md`.
