# Mahesh Challa profile and portfolio

The GitHub profile README and the GitHub Pages portfolio share the same personal content. The portfolio source is `site/index.html`.

## Preview and validate

```sh
npm start -- 4175
npm run readme
npm run check
```

Preview at http://localhost:4175/. `npm run readme` regenerates README content and section banners from the portfolio, including all four projects, skills, milestones and journey. `npm run check` rejects content drift, missing assets, broken anchors and incompatible README image markup.

## Refresh the portrait banner

The README uses `assets/mahesh-hero.png`, a browser capture of the actual portfolio hero. This keeps the photo self-contained in a standard image. GitHub README rendering does not run the portfolio JavaScript; use the Portfolio link for interactive controls.

After changing the hero or portrait, start the local preview and set `BUNDLED_NODE_MODULES` to your existing development tooling directory containing Playwright. Then run:

```sh
node --preserve-symlinks scripts/render-readme-hero.mjs
```

Set `PROFILE_PREVIEW_URL` if using a different preview port. To optimize a new portrait first, use `scripts/prepare-portrait.mjs` with the same tooling directory and Sharp available. These are development tools; the deployed site has no package dependencies.

## GitHub activity

```sh
npm run contributions
npm run generate
```

Both the website and README use MaheshChalla2701's public contribution snapshot. The refresh workflow updates the snapshot and SVG daily.

## Publication

Repository: https://github.com/MaheshChalla2701/MaheshChalla2701

Portfolio: https://maheshchalla2701.github.io/MaheshChalla2701/

GitHub Pages serves `site/`. Select GitHub Actions as the Pages source. Pushing profile changes runs the content checks before deploying the portfolio. Commit the generated README, its image assets and the portfolio source together.

Personal content and portrait are customized for Mahesh Challa. Local QA screenshots and node_modules are ignored.
