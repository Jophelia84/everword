# Everword store data

The theme renders store data; it cannot contain it. These files carry the 30
pieces and the 65 content pages out of the v94 standalone build and into
Shopify. Import them in the order below.

## 1. Create the metafield definitions first

The product page reads these. Import products *after* defining them, otherwise
the columns are ignored and the personalisation fields will not appear.

Settings → Custom data → Products → Add definition:

| Namespace and key                  | Type                          | What it drives |
|------------------------------------|-------------------------------|----------------|
| `everword.personalisation_kind`    | Single line text              | Which field renders: `name`, `names`, `engrave`, `two_line` or `none` |
| `everword.personalisation_label`   | Single line text              | The field label, e.g. "Name or word" |
| `everword.personalisation_max`     | Integer                       | Characters allowed per name or line |
| `everword.message_card`            | True or false                 | Whether the free message card shows |
| `everword.occasions`               | Single line text              | Space-separated occasions; seeds the card's occasion |
| `everword.elevator`                | Single line text              | The short label above the title |
| `everword.tile_meta`               | Single line text              | The line under the title on a product card |
| `everword.specs`                   | Single line text, **list**    | "Details & craftsmanship" |
| `everword.care`                    | Single line text, **list**    | "Product care guide" |

Settings → Custom data → Pages → Add definition:

| Namespace and key    | Type             | What it drives |
|----------------------|------------------|----------------|
| `everword.summary`   | Single line text | The standfirst under a page title |

## 2. Import the products

`everword-products.csv` — 30 products, 147 variants.

Products → Import. Finish, Presentation, and Names/Charms/Ring size come in as
real variant options, because each changes the price. Personalisation text and
the message card are line item properties instead, set at add-to-cart, so they
do not multiply variants.

Prices follow the source's own `price()`: base, plus the finish delta, plus the
box delta, plus `(count − included) × each`. Where an axis had only one value
the source still added its delta but hid the control, so that delta is folded
into the base price rather than becoming a pointless one-value option.

**Inventory** is set to `continue` (keep selling when out of stock) with no
tracker, which is what a made-to-order workshop wants. Change it if you would
rather track stock.

## 3. Add the product images

`Image Src` is deliberately blank. A theme asset's CDN URL is not known until
the theme is uploaded, so there was nothing valid to put there.

The shop still renders immediately: every product falls back to the
`ew-<handle>.webp` bundled in the theme's `assets/`, and all 30 handles have
one. That fallback is for launch, not for good — real product media gets you
zoom, variant images, and correct Open Graph tags.

`product-images/` holds the 117 gallery shots named `<handle>_NN.webp`, in
order. Either drag them onto each product in admin, or upload them to
Content → Files and add an `Image Src` column pointing at the resulting URLs
before importing.

## 4. Import the content

- `everword-pages.csv` — 38 pages (policies, guides, our story, materials)
- `everword-blog-articles.csv` — 27 articles, into a blog called **News**

Create the News blog first (Content → Blog posts → Manage blogs) or the article
import has nowhere to land.

Both CSVs follow the column layout the common bulk-import apps expect
(Matrixify and similar). Shopify's built-in importer handles products only, so
pages and articles need such an app — or use the per-file HTML in `pages/` and
`articles/`, which is the same content ready to paste into the admin editor.

## 5. Point the navigation at it

The footer columns and the header menu are backed by real Shopify menus, so
build them under Content → Menus. The source's four footer columns were Shop,
Occasions, Help and About.

## A note on the collections

The CSV sets each product's **Type** to its shelf (Names, Engraved, Keepsakes,
Pendants, For Him, In Memory, A New Baby, Rings, Bracelets) and tags it with its
occasions (birthday, anniversary, memory, milestone, baby, him, everyday).

Smart collections on those conditions reproduce the source's shelves and
occasion filters without any manual sorting. The home page's six occasion doors
each want one, and the shelf section wants a collection to draw from.
