# Cash Duck GTD Website

Static GTD / wallet collection website ready for Vercel, Netlify or GitHub Pages.

## Main config
Edit `config.js`:
- `xProfileUrl`
- `likePostUrl`
- `quotePostUrl`
- `googleScriptUrl`
- supply / mint date fields if needed

## Submission fields
The form sends JSON fields compatible with the existing Google Apps Script:
`xHandle`, `walletAddress`, `repostLink`, `project`, `timestamp`.

The register form unlocks after all three X task buttons are clicked.
