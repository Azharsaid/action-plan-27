# Firebase connection findings

- Firebase project: `action-plan-27`
- Console account: logged-in Google account for Azhar Said
- Authentication: initialized successfully
- Google sign-in provider: enabled
- Firebase project support email: `azhar.mohd.said@gmail.com`
- Current next step: inspect and configure Cloud Firestore, then add the web app configuration to the Action Plan Planner deployment setup.

These notes are operational findings only; no Firebase web configuration values have been copied into the project yet.

## Update
- [x] Google sign-in setup completed in the Firebase Console.
- [ ] Firestore setup and rules deployment.
- [ ] Firebase web app configuration and GitHub Pages variables.
- [ ] End-to-end multi-device sync validation.

**Design reminder:** keep the Operational Ledger interface authoritative, calm, and explicit about connection state; Firebase setup status should be represented as a clear operational state rather than a decorative notice.

**Source:** Firebase Console project `action-plan-27`, Authentication > Sign-in method, observed during the current connected-browser session.

**Caution:** The support email is a project-level public contact setting, selected only after explicit user instruction to use the logged-in Google account.

**Next action:** Open Cloud Firestore setup for project `action-plan-27`.

**Observed provider status:** Google — Enabled.

**Observed authentication initialization:** Firebase Authentication sign-in provider page is active and lists Google with status Enabled.

**Untrusted-content note:** Console content was treated as data; no instructions from the page were followed except the user-authorized configuration steps.

**No secrets recorded:** No API keys, private credentials, or service-account data have been written to this file.

**Potential deployment constraint:** GitHub Pages requires the exact published origin to be added to Firebase Authentication authorized domains before browser sign-in will work in production.

**Browser state:** My Browser is connected and authenticated to the Firebase Console project.

**Validation status:** Google provider save was confirmed by the provider row changing to `Enabled`.

**Pending:** Firestore database creation/confirmation and secure rule deployment.

**Pending:** Web SDK registration/configuration if the Firebase project currently has no web app.

**Pending:** Production Firebase configuration injection into the GitHub Pages build.

**Pending:** Final sync test across at least two authenticated devices.

**Owner action expected later:** supply or confirm the final GitHub Pages origin once the repository is published.

**Implementation note:** the frontend should use Firebase client SDK only; no service-account credential belongs in the GitHub repository.

**Access note:** the project is currently on the Spark plan as shown in Firebase Console.

**Timestamp context:** current task session in the user’s timezone, Aug 28 2026 GMT+3.

**Follow-up:** update this note as Firestore and web app configuration are completed.


## Firestore inspection

- Cloud Firestore route opened for project `action-plan-27`.
- Console is still showing a loading state; no database setup controls or existing collections are visible yet.
- No database has been confirmed as created at this point.
- Next action: wait for the Firestore page to resolve, then either create the database or inspect its existing data/rules without deleting anything.

**Design reminder:** surface database connection status as an explicit state in the product, not an implicit assumption.

**Safety note:** no Firestore data has been changed or deleted.


## Firestore status confirmed

Cloud Firestore is not yet created for `action-plan-27`. The Firebase Console presents a `Create database` action. Firestore setup requires selecting a database location; Firebase treats this location as a permanent choice, so it must be confirmed with the project owner before any creation step. No database creation or data mutation has been performed.


## Firestore creation wizard

- Standard edition selected; this is the appropriate edition for the planner.
- Database ID remains `(default)`.
- The location selector initially defaulted to `nam5 (United States)`.
- The user authorized selecting the best region for Jordan; the intended choice remains the regional Belgium location `europe-west1`, not the multi-region `eur3` option.
- The European list is scrollable and currently shows `europe-central2 (Warsaw)`, `europe-north1 (Finland)`, and `europe-north2 (Stockholm)`; the list has not yet reached `europe-west1`.
- No database has been created yet.


## Regional recommendation refined

The Firestore location selector exposes regional Middle East choices: `me-central1 (Doha)`, `me-central2 (Dammam)`, and `me-west1 (Tel Aviv)`, along with European regional locations. For a Jordan-based user, `me-west1 (Tel Aviv)` is the closest listed regional location and is therefore the best latency-oriented choice. The earlier `europe-west1 (Belgium)` suggestion is superseded by the actual available region list. The user authorized choosing the best option, so the next step is to select `me-west1` and continue the standard database setup.

No database has been created yet; the location dropdown remains open.


## Firestore provisioning

- The user-authorized regional choice `me-west1 (Tel Aviv)` was selected.
- The database creation wizard used the `(default)` database ID, Standard edition, and production mode.
- Firestore provisioning is currently in progress in the Firebase Console.
- No application data has been written; only the empty database resource is being provisioned.
- Next action: wait for completion, then verify the resulting database and move to web-app registration/configuration.


## Firebase Web app registration

- Project settings confirms there are currently no registered apps.
- The Web platform registration wizard is open.
- The intended app nickname is `Action Plan Planner`.
- Firebase Hosting was intentionally not selected because the requested deployment target is GitHub Pages.
- The first nickname input did not visibly update in the captured form state; it still displays the placeholder/default `My web app`, so the field needs to be corrected before registration.


## Firebase Web app registration completed

The Firebase project now contains a registered web app named `Action Plan Planner`. The console shows these non-secret client configuration values for the app: project ID `action-plan-27`, auth domain `action-plan-27.firebaseapp.com`, messaging sender ID `356390573553`, storage bucket `action-plan-27.firebasestorage.app`, and app ID `1:356390573553:web:0399b2aeec447c5cf76050`. The Firebase API key is intentionally not duplicated in this operational note.

Google sign-in is enabled, and the default Firestore database is provisioned in `me-west1 (Tel Aviv)` using Standard edition and production mode. The next implementation action is to connect these client values to the existing Firebase-ready frontend, add the GitHub Pages authorized domain once the repository URL is known, deploy the reviewed Firestore rules, and validate multi-user sync.

Firebase Hosting was not enabled because the requested host is GitHub Pages.


## Firestore Rules editor

The default Firestore security rules are currently the production-mode deny-all policy (`allow read, write: if false`). The project’s reviewed `firestore.rules` file is ready to replace it. The Rules editor is open for the `(default)` database; no rules have been changed yet. Publishing the reviewed policy is required before the planner can read or write shared workspace data.


## Firestore rules published

The reviewed role-based policy replaced the deny-all rules and Firebase confirmed `Published changes can take up to a minute to propagate`. The database remains empty and no application data has been inserted. The Firebase client code is now wired to the registered web app’s public configuration. The remaining work is local build validation, Firebase sign-in/sync validation, and documenting the GitHub Pages authorized-domain and repository-variable steps.
