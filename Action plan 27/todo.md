# Firebase connection checklist

- [x] Confirm that the provided Firebase Console project is accessible in the active browser session.
- [x] Inspect registered web apps, Authentication providers, Firestore status, and current security rules.
- [x] Obtain or create the Firebase web application configuration required by the Action Plan Planner.
- [x] Configure Google authentication and select the project support email.
- [ ] Add the final GitHub Pages origin to Firebase Authentication authorized domains after the repository URL is known.
- [x] Create the default Firestore database in `me-west1` (Tel Aviv) using production mode.
- [x] Deploy the reviewed Firestore rules for roles, master data, budgets, and activities.
- [x] Wire the Firebase web configuration into the frontend build and validate TypeScript/production output.
- [ ] Validate first-owner bootstrap and multi-device synchronization after the GitHub Pages origin is authorized.
- [ ] Report completed configuration and any user action still required for GitHub Pages deployment.


## GitHub Pages deployment fix

- [x] Inspect the published Pages URL and confirm it is rendering the repository README.
- [x] Inspect the failed GitHub Actions run for checkpoint `ff2ced6`.
- [x] Confirm the root cause: the workflow runner cannot locate the `pnpm` executable.
- [ ] Patch `.github/workflows/deploy.yml` to install and activate pnpm before dependency installation.
- [ ] Validate the workflow YAML and local production build after the patch.
- [ ] Save a new checkpoint so GitHub Actions receives the corrected workflow.
- [ ] Confirm the Pages URL serves the React application and add `azharsaid.github.io` to Firebase Authorized Domains.
