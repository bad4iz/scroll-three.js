# Demo images

The demo uses five neutral landscape photographs from [Unsplash](https://unsplash.com), distributed under the [Unsplash License](https://unsplash.com/license).

| File | Subject | Source |
| --- | --- | --- |
| `lake.jpg` | Mountain lake | [Original photograph](https://images.unsplash.com/photo-1470770841072-f978cf4d019e) |
| `forest.jpg` | Sunlit forest path | [Original photograph](https://images.unsplash.com/photo-1441974231531-c6227db76b6e) |
| `mountains.jpg` | Mountain valley | [Original photograph](https://images.unsplash.com/photo-1464822759023-fed622ff2c3b) |
| `sunset.jpg` | Sunset over forested hills | [Original photograph](https://images.unsplash.com/photo-1500534623283-312aade485b7) |
| `ocean.jpg` | Ocean waves | [Original photograph](https://images.unsplash.com/photo-1518837695005-2083093ee35b) |

Local JPEG copies are 1136 × 728 pixels, requested with `fit=crop&w=1136&h=728&q=85&fm=jpg`. The gallery does not depend on external image requests at runtime.

`public/assets` supplies the current source example. GitHub Pages serves the separate, earlier scroll demo in `docs`; its gallery uses all five photos. Keep the copies in both directories in sync. Replacing the deployed JavaScript also requires updating its filename in `docs/index.html` so cached pages load the new asset references.
