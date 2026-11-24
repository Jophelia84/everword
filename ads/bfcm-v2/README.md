# Black Friday ads, v2 (real products, shop by person)

Made from the live catalogue on shopeverword.com (Nov 24). Offer: 20% off 1 gift, 25% off 2, 30% off 3+, free US shipping, through Dec 1. Then 20% off with the Dec 15 order-by deadline.

## Ads and where each one should link
| Ad | Recipient | Headline | Link to |
|---|---|---|---|
| `bf-everyone` | everyone (montage) | up to 30% off for everyone on your list. | sale / gifts collection |
| `bf-mom` | mom | her name, in bloom. | /products/personalized-birth-flower-name-necklace ($74) |
| `bf-grandma` | grandma | her favorite people, to hold. | /products/grandmas-favorites-woven-photo-blanket ($69) |
| `bf-kids` | the little ones | their name, by the fire. | /products/personalized-winter-village-christmas-stocking ($39) |
| `bf-couple` | you two | our first christmas. | /products/our-first-christmas-couple-photo-ornament ($34) |
| `bf-pets` | pet people | best boy, always. | /products/personalized-watercolor-pet-portrait-blanket ($69) |
| `bf-family` | whole family | one name, whole family. | /products/christmas-wreath-family-name-blanket-navy ($69) |
| `bf-nursery` | nursery | goodnight, oscar. | /products/personalized-whale-name-night-light ($54) |
| `bf-starmap` | you two | the night it all began. | /products/custom-star-map-anniversary-night-light ($54) |
| `bf-puzzle` | little explorer | his name, his adventure. | /products/personalized-dinosaur-discovery-puzzle ($39) |

The montage shows: mom (necklace), grandma (blanket), little ones (stocking), you two (ornament), pet people (blanket), whole family (blanket), then the offer card.

## Schedule
| Dates | Run |
|---|---|
| Nov 26 – Dec 1 | `bf-everyone` + all `bf-*` singles + `offer` and product statics |
| Dec 2 – 12 | `deadline-everyone` + `deadline` static (switch singles' end card to the deadline version if you re-render) |
| Dec 13 – 14 | `deadline-3days` |
| Dec 15 | `deadline-lastday` |

Videos are silent: add music in Meta. Each ad comes in 9x16 (Reels/Stories) and 4x5 (feed).

## Re-rendering
Edit `template/bfcm.html` (products, copy, offer), then from `template/`:

    PAGE=bfcm.html Q="v=single-mom" node render.js 1920 frames video
    ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libx264 -crf 19 -pix_fmt yuv420p out.mp4

Variants: `montage-bf`, `montage-deadline` (add `&days=N` for a countdown badge), `early`, `single-<product>`. Products with `top:true` put the headline at the top so the name on the product stays visible.
