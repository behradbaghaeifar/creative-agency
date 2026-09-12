# Meridian — Creative Agency Website

Static 3-page site (Home, Work, Contact). Pure HTML/CSS/JS, no build step.

## Deploy on Netlify
1. Drag the `creative-agency` folder onto Netlify's "Deploy manually" area,
   or connect the repo and set the publish directory to the project root.
2. No build command is required — it's a static site.

## Run locally
Open `index.html` directly, or serve the folder with any static server, e.g.:
```
npx serve .
```

## Notes
- Fonts (Space Grotesk, Inter, Playfair Display) load from Google Fonts.
- Smooth scroll (Lenis), reveal/parallax animation (GSAP + ScrollTrigger) load from CDN.
- Project imagery is pulled from Unsplash as high-quality placeholders — swap the
  `<img src>` values in `index.html` / `work.html` for real project photography.
- The contact form is front-end only (no backend wired up); hook `js/script.js`'s
  `initContactForm` submit handler up to your form service of choice (e.g. Netlify Forms,
  Formspree) when ready.
