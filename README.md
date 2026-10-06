# chatgpt-sandbox-publisher

A tiny static site that provides a reusable prompt for teaching ChatGPT how to publish sandbox-created projects through a separate `sandbox-publisher` GitHub repository.

This repository contains **the prompt and the copy UI only**. It is not the publisher/automation repository itself.

## What this is for

Some ChatGPT GitHub integrations can edit existing repositories but cannot create a new repository. A separate publisher repository can bridge that gap:

```text
ChatGPT sandbox
    ↓
existing sandbox-publisher repo
    ↓
staging files + publish request
    ↓
GitHub Actions
    ↓
new destination repository
```

This project makes the instructions for that workflow easy to copy into ChatGPT.

## Files

- `index.html` — static copy UI
- `app.js` — loads the prompt template and applies the form values
- `style.css` — minimal monochrome styling
- `prompt.template.md` — reusable prompt with placeholders
- `README.md` — this file

## Placeholders

The prompt template supports:

- `{{PUBLISHER_REPO}}` — the existing bridge repository, e.g. `your-name/sandbox-publisher`
- `{{TARGET_OWNER}}` — default destination owner
- `{{DEFAULT_VISIBILITY}}` — `private` or `public`

The website replaces these values before copying the prompt.

## Deploy

No build step is required.

For GitHub Pages, publish the repository root from the default branch.

For local testing:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Important

The prompt deliberately tells ChatGPT not to request or store personal access tokens. Repository creation should be performed by the separate publisher workflow, not by placing credentials in the prompt or staged project.
