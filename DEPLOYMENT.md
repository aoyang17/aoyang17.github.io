# Private source, public GitHub Pages output

This repository can be used as the private source repository for the site. The
GitHub Actions workflow builds the Jekyll site and publishes only `_site/` to
the public `aoyang17/aoyang17.github.io` repository.

## Repository layout

- Private source repository: contains Markdown, Jekyll templates, Sass, scripts,
  images, and workflow files.
- Public Pages repository: `aoyang17/aoyang17.github.io`, contains only the
  generated static site files from `_site/`.

## One-time setup

1. Create a new private repository, for example `aoyang17/personal-site-source`.
2. Push this source tree to that private repository instead of pushing it to
   `aoyang17/aoyang17.github.io`.
3. Generate a deploy key:

   ```sh
   ssh-keygen -t ed25519 -C "github-actions-pages-deploy" -f pages-deploy-key
   ```

4. In the public `aoyang17/aoyang17.github.io` repository, add
   `pages-deploy-key.pub` as a deploy key with write access:

   `Settings -> Deploy keys -> Add deploy key -> Allow write access`

5. In the private source repository, add the private key as an Actions secret:

   `Settings -> Secrets and variables -> Actions -> New repository secret`

   Secret name:

   ```txt
   PAGES_DEPLOY_KEY
   ```

   Secret value: the full contents of `pages-deploy-key`.

6. In `aoyang17/aoyang17.github.io`, configure GitHub Pages to serve from:

   ```txt
   Branch: master
   Folder: / (root)
   ```

## Publishing

Push changes to the private source repository. The workflow builds the site and
force-publishes `_site/` to the public Pages repository.

Do not keep private drafts, source-only notes, or unpublished assets in `_site/`
or in files copied into the final site. Anything published to the public Pages
repository is visible to visitors.
