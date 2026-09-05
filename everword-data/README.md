# Everword store content

Products are **not** here — ShineOn's app supplies those. What is here is the
writing from the standalone build, which has nothing to do with the supplier and
would otherwise be lost.

## The content

- `everword-pages.csv` — 38 pages: our story, materials, shipping, returns,
  care, the message card, the policies, and the guides
- `everword-blog-articles.csv` — 27 articles, into a blog called **News**
- `pages/` and `articles/` — the same content as one HTML file each

Create the News blog first (Content → Blog posts → Manage blogs) or the article
import has nowhere to land.

Both CSVs follow the column layout the common bulk-import apps expect (Matrixify
and similar). Shopify's own importer handles products only, so pages and
articles need such an app — or paste the HTML files into the admin editor.

Page standfirsts ride along as an `everword.summary` metafield rather than a
Summary column, because Shopify pages have no native summary field and a plain
column would be silently dropped.

## Optional: the product metafields

The theme does not need these. Personalisation and the message card are
configured on the blocks themselves in the theme editor, which is what a
supplier import wants — set it once for the template rather than per product.

Define these only if you want a specific product to differ from that default:

| Namespace and key                | Type                       | Overrides |
|----------------------------------|----------------------------|-----------|
| `everword.personalisation_kind`  | Single line text           | Which field renders: `name`, `names`, `engrave`, `two_line`, `none` |
| `everword.personalisation_label` | Single line text           | The field label |
| `everword.personalisation_max`   | Integer                    | Characters per name or line |
| `everword.message_card`          | True or false              | Whether the card shows |
| `everword.occasions`             | Single line text           | Seeds the card's occasion |
| `everword.tile_meta`             | Single line text           | The line under a product card title |
| `everword.specs`                 | Single line text, **list** | The "Details & craftsmanship" accordion |
| `everword.care`                  | Single line text, **list** | The "Product care guide" accordion |

Without `tile_meta`, product cards read the line off whichever option is named
Finish, Colour, Material, Metal or Plating. Without `specs` or `care`, that
accordion is simply left out.

## Pointing the personalisation at ShineOn's options

The multi-name field limits how many lines it accepts to whatever the count
option is set to. It looks for an option named Names, Charms, Quantity of names
or Number of names. If ShineOn names it something else, either rename it on the
product or set the count with the metafields above.

Finish, box and size come in from ShineOn as ordinary variant options and need
nothing from this theme — they price themselves. Personalisation text and the
message card are line item properties, so they never multiply variants.
