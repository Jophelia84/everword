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
| `window.__P` (30 products) | `everword-data/everword-products.csv`, 147 variants |
| `window.__IMG` + inline base64 | 426 files in `assets/` |
| `window.__SHIP` / `__EXP` | Settings on the Everword product details block |
| `window.__PDPX` per-product copy | `everword.*` product metafields |
| `CARDS` phrase bank | `assets/everword-cards.json` |

## Getting it running

1. Upload `everword-horizon-theme.zip` under Online Store → Themes → Add theme.
2. Follow `everword-data/README.md` — **metafield definitions before the product
   import**, or the personalisation fields will not appear.
3. Build the header and footer menus under Content → Menus.
4. Create smart collections on product Type and tags to feed the home page's
   occasion doors and shelf.

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

**Personalisation clamping is deliberate.** `assets/everword-personalisation.js`
folds text to ASCII before it cuts it, because ShineOn cannot cut accents or
emoji and an unsupported character holds the order. "José" becomes "Jose"
rather than losing its last letter. `maxlength` alone is not enough: it ignores
script-set values and counts UTF-16 units, so an emoji costs two and can be cut
in half. Spaces are blocked on name fields — a product decision, not a supplier
rule; set `data-block-spaces="false"` to allow them again.

**Options versus properties.** Finish, Presentation and Names/Charms/Ring size
change the price, so they are real variant options. Personalisation text and the
message card do not, so they are line item properties — which keeps 30 products
at 147 variants instead of many thousands.

**The hero film.** `assets/ew-hero-film.mp4` and `.webm` ship with the theme, but
Shopify's asset directory does not reliably accept video. If the upload strips
them, put them in Content → Files and paste the URLs into the film hero section's
settings — it reads them from there.

**Dead CSS was left alone.** The stylesheet still carries rules for `.news`,
`.who`, `.band`, `.occ` and `.tiles`. No v94 markup uses any of them, so they are
earlier versions left behind; no sections were built for them.

## What was not carried over

Horizon's header is kept rather than the source's. Rebuilding that nav would
mean reimplementing the cart drawer, predictive search and mobile drawer that
Horizon already ships working and accessible; the Everword palette and type
restyle it in place. The mega-menu panels, the wishlist and the search overlay
are the parts of the source this leaves behind.

## Licence

Horizon is licensed by Shopify for building themes that run on Shopify. That
permits this store's own use and delivery to a merchant as a service engagement.
It does **not** permit submitting a Horizon-derived theme to the Shopify Theme
Store, or reselling or redistributing it. See `LICENSE.md`.
