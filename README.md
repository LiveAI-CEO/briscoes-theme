# Briscoe's Kitchen & Spice — Shopify theme

This repository contains the Liquid sections, JSON templates, assets, and theme settings for Briscoe's Kitchen & Spice (`onepotfamily`). Product catalog, stock, prices, template assignments, and Shopify Customers are **Shopify Admin data** and are not stored here.

## Deployment status (verified November 20, 2026)

- **Published Shopify theme:** `189889773667` — *One Pot Family - Product Cart Lead Repair*. Its five repaired product, cart, and signup files matched GitHub [PR #4](https://github.com/LiveAI-CEO/briscoes-theme/pull/4) in a read-only comparison. Shopify may prepend auto-generated comments to JSON templates; compare their parsed JSON, not raw bytes.
- **Former theme:** `141762396259` — *briscoes-theme/main*, now unpublished. Its default product template references the deleted `chef-briscoe-jamaican-bold` section. **Do not treat it as a known-good rollback.**
- **GitHub default branch:** `main`. PR #4 contains the live repair, but was unmerged when this status was recorded. **The exact GitHub-to-Shopify connection mapping has not been independently confirmed.** A theme's name is not proof of its GitHub branch connection.

Never assume that pushing to `main` updates the published theme—or that it is safe to merge without checking the Shopify theme card's GitHub connection. There is no deployment workflow in this repository. The workflow added in this cleanup performs **validation only** and never pushes to or publishes Shopify.

## Theme layout

- `layout/theme.liquid`: shared document shell.
- `templates/*.json`: Online Store 2.0 template instances and section order.
- `sections/*.liquid`: editable storefront sections with JSON schemas.
- `sections/bk-main-product.liquid`: real product data, variant selection, Shopify add-to-cart form, app blocks, and Shopify-native One Pot Family signup.
- `sections/bk-main-cart.liquid`: line items, quantities, totals, and native checkout action.
- `assets/`, `config/`, and `locales/`: theme assets, settings, and translations.

## Validate changes

Install Node.js 22+ and run:

```sh
node scripts/validate-theme.mjs
```

The validator checks JSON syntax, exact section filenames, section and block order references, Liquid section schemas, and the presence of product/cart purchase controls. The GitHub Actions workflow runs this check for pull requests and pushes to `main`; it is **not** a Shopify deployment mechanism.

Before release, also run Shopify Theme Check in a supported development environment, reconcile existing warnings, and validate the unpublished theme in Shopify's editor.

## Release and rollback checklist

1. Confirm the exact branch-to-theme connection in **Shopify Admin → Online Store → Themes** before any merge or deployment.
2. Review the diff and run the validator and Shopify Theme Check.
3. Test a **separate unpublished theme** on desktop and mobile, including BKS Apron and Island Gold without a query string, with `?variant=43695504130147`, and with the original YouTube Shopping product-card URL.
4. Confirm that the **Single Bottle** variant and live price display, add-to-cart inserts that exact variant, the cart is correct, and checkout opens. **Do not place a test order without authorization.**
5. Submit a lead only with an authorized test email; confirm actual delivery to Shopify Customers and any intended CRM, not only a success message.
6. Identify and verify a **functioning** rollback theme/version before publishing. A snapshot of the old broken template is only a baseline backup.
7. Obtain human publish approval and smoke-test the actual YouTube mobile product card after release.

## Source-of-truth caution

A previous repository-versus-Shopify audit found `sections/bk-catalog-product-feature.liquid` in GitHub but absent from the then-published theme, and homepage template content had drifted. Do not deploy the entire repository as a replacement theme without reconciling these differences. The published repair and PR #4 were compared specifically for the five changed files, **not** for every storefront file.
