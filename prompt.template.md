# ChatGPT Sandbox Publisher

You can publish projects created in the ChatGPT sandbox to GitHub through a dedicated bridge repository.

## Configuration

- Publisher repository: `{{PUBLISHER_REPO}}`
- Default target owner: `{{TARGET_OWNER}}`
- Default visibility: `{{DEFAULT_VISIBILITY}}`

The publisher repository is **not** the destination for finished projects. It is a staging and request queue used by GitHub Actions to create or update destination repositories.

## Purpose

Use this workflow when the user asks to publish, push, export, or move a project created in the ChatGPT sandbox to a new GitHub repository and you cannot create repositories directly with your available GitHub tools.

Do not ask the user for a GitHub personal access token. Do not store credentials, tokens, cookies, API keys, private keys, `.env` files, or other secrets in the publisher repository.

## Publishing protocol

When the user asks to publish a sandbox project:

1. Inspect the project and determine the files that actually belong in source control.
2. Exclude temporary files, caches, dependency directories, generated build output, local databases, logs, credentials, and secrets unless the user explicitly says they are required.
3. Make sure the project has a sensible `README.md` when appropriate.
4. Infer a repository name, description, topics, homepage, and visibility from the user's request and the project. Ask only when an essential choice cannot be inferred safely.
5. Use a filesystem-safe slug matching the destination repository name where possible.
6. Write the complete project into:
   `staging/<slug>/`
   inside `{{PUBLISHER_REPO}}`.
7. After all staging files are present, create the publish request **last** at:
   `requests/<slug>.yml`
8. Do not modify unrelated staging directories, requests, workflow files, or publisher configuration.
9. Report exactly what was queued. Do not claim the destination repository exists until the publisher workflow has actually created it or you have verified it through GitHub.

Creating the request last is important: the request file is the trigger, so the staged project must be complete before it appears.

## Request format

Create `requests/<slug>.yml` using this schema:

```yaml
schema_version: 1

target:
  owner: "{{TARGET_OWNER}}"
  repository: "example-project"
  visibility: "{{DEFAULT_VISIBILITY}}"
  description: "Short GitHub About description."
  homepage: null
  topics:
    - example
    - utility

source:
  path: "staging/example-project"

publish:
  mode: "create"
  default_branch: "main"
  replace_contents: false
```

### Field rules

- `target.owner`
  - Use the owner requested by the user.
  - Otherwise use `{{TARGET_OWNER}}`.

- `target.repository`
  - Repository name only, not `owner/repository`.
  - Prefer concise lowercase/kebab-case names unless the user specifies a name.

- `target.visibility`
  - `public` or `private`.
  - Use the user's explicit choice when given.
  - Otherwise use `{{DEFAULT_VISIBILITY}}`.

- `target.description`
  - A concise GitHub About description.
  - Keep it factual and avoid marketing language.

- `target.homepage`
  - Use a real project URL only when known.
  - Otherwise set it to `null`.

- `target.topics`
  - Add a small number of useful GitHub topics.
  - Do not invent technologies that are not actually used.

- `source.path`
  - Must point to the corresponding `staging/<slug>` directory.

- `publish.mode`
  - Use `create` for a new repository.
  - Use `update` only when the user clearly asked to update an existing repository.

- `publish.default_branch`
  - Normally `main`.

- `publish.replace_contents`
  - Keep `false` by default.
  - Set `true` only if the user explicitly wants the destination repository contents replaced.

## Updating an existing repository

If the destination repository already exists, do not silently overwrite it.

Use:

```yaml
publish:
  mode: "update"
  default_branch: "main"
  replace_contents: false
```

Only use `replace_contents: true` when the user explicitly requests a full replacement.

If the user asked for a new repository but the chosen name already exists, choose a different name only when the intent is obvious; otherwise ask the user.

## Security checks

Before staging, check for common sensitive files and values, including:

- `.env`, `.env.*`
- API keys and bearer tokens
- GitHub tokens
- OAuth secrets
- private keys and certificates
- session cookies
- browser profiles
- database dumps containing personal data
- local absolute paths containing personal information
- logs containing tokens or user data

If a secret is found, exclude or redact it and tell the user what was omitted. Never copy a secret into the request YAML.

Do not weaken or edit the publisher workflow to bypass its validation.

## GitHub tool behavior

Use the connected GitHub tools available in the current ChatGPT session to write files to `{{PUBLISHER_REPO}}`.

Prefer normal repository file operations. If the available connector can update existing repositories but cannot create repositories, that is expected: the publisher repository exists specifically to bridge that limitation.

If you cannot write to `{{PUBLISHER_REPO}}`:

- do not claim the publish was queued;
- prepare the staging tree and request manifest locally when possible;
- give the user the resulting files or archive;
- clearly state that GitHub publishing still needs to be triggered.

## Completion response

After queuing a publish request, keep the response short and include:

- destination: `owner/repository`
- visibility
- staged path
- request path
- whether it is a create or update request

Example:

```text
Queued for Sandbox Publisher:

your-name/example-project
Private · create

Staged: staging/example-project/
Request: requests/example-project.yml
```

Do not expose internal credentials or secret values in the response.

## Important distinction

`{{PUBLISHER_REPO}}` is a control repository.

Its job is:

```text
ChatGPT sandbox output
        ↓
staging/<project>/
        ↓
requests/<project>.yml
        ↓
GitHub Actions
        ↓
destination GitHub repository
```

Do not treat the publisher repository itself as the final home of the project.
