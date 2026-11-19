# Black Friday / Christmas ad batch

Offer: **Gift more, save more**, 20% off 1 gift, 25% off 2, 30% off 3 or more, with free US shipping.
Deadline phase: 20% off everything, order by Dec 15 for Christmas delivery (ShineOn production cutoff is Dec 17, 3 AM ET).

## When to run what
| Dates | Creative |
|---|---|
| Nov 19–22 | `early-access` (email list growth) |
| Nov 23–Dec 1 | `bf-montage`, `bf-stocking`, `bf-oscar`, `bf-junekai`, `bf-parker`, `offer` static |
| Dec 2–12 | `deadline-montage`, `deadline` static |
| Dec 13–14 | `deadline-3days` |
| Dec 15 | `deadline-lastday` |

Every file comes in 9x16 (Reels/Stories) and 4x5 (feed). Videos are silent: add music in Meta.

## Changing copy, dates or products
Edit the block at the top of `template/bfcm.html`, then render a variant:

    cd template
    Q="v=montage-deadline&days=5" node render.js 1920 frames video
    ffmpeg -framerate 30 -i frames/f%04d.jpg -c:v libx264 -crf 19 -pix_fmt yuv420p out.mp4

Variants: `montage-bf`, `montage-deadline` (optional `days=N`), `early`, `single-<product>`.
