# Visual and implementation validation

## Checks completed

| Check | Result |
| --- | --- |
| TypeScript validation | Passed with `pnpm check`. |
| Production build | Passed with `pnpm build`. Vite reported a bundle-size advisory caused by Excel workbook support, but no build error. |
| AP27 source template | Verified that `Data` and `Key` sheets exist, `Data` contains 20 headers, and `Data!L1` retains `SUBTOTAL(9,L3:L175)`. |
| Desktop workspace | Overview, AP27 sheet, shared-allocation, and administration views display a fixed dark navigation rail, persistent country ribbon, ledger wordmark, generated artwork, and operational panels. |
| Mobile workspace | AP27 sheet and administration views reflow to a single column; the horizontal workbook table remains scrollable and the fixed mobile navigation is intentionally omitted from full-page capture. |
| Visual review follow-up | The review’s accepted recommendations—strong permanent shell, wordmark, country ribbon, restricted vermilion signals, and ledger panel language across all pages—were incorporated and recorded in `ideas.md`. |

## Known deployment dependency

The implementation is functional in local preview mode, but shared operation depends on the user adding Firebase project values, deploying the included Firestore rules, enabling Google sign-in, authorizing the GitHub Pages domain, and configuring a CORS-accessible pristine AP27 template URL. These steps are deliberately documented rather than performed without access to the user’s Firebase and GitHub accounts.
