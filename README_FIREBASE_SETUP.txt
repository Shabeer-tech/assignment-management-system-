ASSIGNMENT MANAGEMENT SYSTEM - FINAL FIREBASE SETUP

The existing HTML/CSS design and pages are kept. Firebase is connected to the existing login/register/dashboard/admin flow.

ADMIN GMAIL
552560sam@gmail.com

DO THESE ONCE IN FIREBASE CONSOLE
1. Authentication -> Sign-in method -> Email/Password -> Enable.
2. Authentication -> Sign-in method -> Google -> Enable.
3. Firestore Database -> already created -> Rules -> paste/publish firestore.rules from this folder.
4. Storage -> if Firebase asks you to upgrade to Blaze, do not upgrade unless you accept billing. Cloud Storage upload cannot work until Storage is enabled.
5. If Storage is enabled, paste/publish storage.rules in Storage -> Rules.

RUN THE WEBSITE
Use VS Code Live Server. Do not open HTML with file://.

LOGIN BEHAVIOR
- 552560sam@gmail.com -> admin.html
- Every other authenticated account -> dashboard.html
- Forgot password sends Firebase reset email.
- Google login also works when Google provider is enabled.

IMPORTANT
The old upload.html is only the original HTML reference. The Firebase-connected upload page is admin.html.
