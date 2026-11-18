# Everword ad template

`everword-ad-template.html` is a 16-second motion ad in the shopeverword.com style
(Prata headlines in navy, Alegreya Sans, paper and tile backgrounds, gold accents).

## Swap in your own content
Edit the `AD` block at the top of the HTML. Every image slot starts as `null`, which
shows a labelled placeholder. Put a path or URL in a slot to use a real photo:

- `hero`: lifestyle photo, landscape (3:2)
- `people[n].portrait`: round "shop by person" portrait
- `people[n].product`: product photo, square (1:1)
- `personal.image`: engraving or name close-up

The headline, recipients, lines, chips and end card copy are in the same block.

## Render
Needs Node, Playwright and ffmpeg.

    node render.js 1920 frames-916          # 9:16 Reels/Stories frames
    node render.js 1350 frames-45           # 4:5 feed frames
    ffmpeg -framerate 30 -i frames-916/f%04d.jpg -c:v libx264 -crf 18 -pix_fmt yuv420p out-9x16.mp4

Add `stills` as a third argument to render a few key frames as PNGs for checking.

## Other templates
- `everword-story-ad.html`: line-drawn story ("Everyone she loves, in one place")
- `everword-callout-ad.html`: dashed arrows label the product, then it flips to the back
- `everword-stickfigure-ad.html`: stick-figure "Stop / Start" story with chunked captions

Render any of them by setting `PAGE`, for example `PAGE=everword-callout-ad.html node render.js 1920 frames`.
