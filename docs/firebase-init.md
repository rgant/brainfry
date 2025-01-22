# Firebase Init

Something happened when I ran `ng add @angular/fire` and I don't think the init
fully worked. So this is a record of my manual running of the command:

```
$ firebase init

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  /Users/rgant/Programming/brainfry

Before we get started, keep in mind:

  * You are initializing within an existing Firebase project directory

? Which Firebase features do you want to set up for this directory? Press Space to select features, then Enter to confirm your choices. Firestore: Configure security rules and indexes files for Firestore,
Functions: Configure a Cloud Functions directory and its files, App Hosting: Configure an apphosting.yaml file for App Hosting, Storage: Configure a security rules file for Cloud Storage, Emulators: Set up local
emulators for Firebase products

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,
but for now we'll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: brainfry-app (The Brain Fry)
i  Using project brainfry-app (The Brain Fry)

=== Firestore Setup

Firestore Security Rules allow you to define how and when to allow
requests. You can keep these rules in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore Rules? firestore.rules
? File firestore.rules already exists. Do you want to overwrite it with the Firestore Rules from the Firebase Console? No

Firestore indexes allow you to perform complex queries while
maintaining performance that scales with the size of the result
set. You can keep index definitions in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore indexes? firestore.indexes.json

=== Functions Setup
Let's create a new codebase for your functions.
A directory corresponding to the codebase will be created in your project
with sample code pre-configured.

See https://firebase.google.com/docs/functions/organize-functions for
more information on organizing your functions using codebases.

Functions can be deployed with firebase deploy.

? What language would you like to use to write Cloud Functions? TypeScript
? Do you want to use ESLint to catch probable bugs and enforce style? Yes
✔  Wrote functions/package.json
✔  Wrote functions/.eslintrc.js
✔  Wrote functions/tsconfig.json
✔  Wrote functions/tsconfig.dev.json
✔  Wrote functions/src/index.ts
✔  Wrote functions/.gitignore
? Do you want to install dependencies with npm now? No

=== Apphosting Setup
i  Writing default settings to apphosting.yaml...
✔  Wrote apphosting.yaml
✔  Create a new App Hosting backend with `firebase apphosting:backends:create`

=== Storage Setup

Firebase Storage Security Rules allow you to define how and when to allow
uploads and downloads. You can keep these rules in your project directory
and publish them with firebase deploy.

? What file should be used for Storage Rules? storage.rules
? File storage.rules already exists. Overwrite? No
i  Skipping write of storage.rules

=== Emulators Setup
? Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices. App Hosting Emulator, Authentication Emulator, Functions Emulator, Firestore Emulator,
Storage Emulator
? Which port do you want to use for the apphosting emulator? 5002
i  apphosting: Initializing Emulator
? Specify your app's root directory relative to your repository ./
? What configs would you like to export? Secret
? Select a default Firebase project for this directory: brainfry-app (The Brain Fry)
? Which environment would you like to export secrets from Secret Manager for? base (apphosting.yaml)
Wrote secrets as environment variables to apphosting.local.yaml.
apphosting.local.yaml has been automatically added to your .gitignore.
? Which port do you want to use for the auth emulator? 9099
? Which port do you want to use for the functions emulator? 5001
? Which port do you want to use for the firestore emulator? 8080
? Which port do you want to use for the storage emulator? 9199
? Would you like to enable the Emulator UI? Yes
? Which port do you want to use for the Emulator UI (leave empty to use any available port)? 4000
? Would you like to download the emulators now? Yes
i  firestore: downloading cloud-firestore-emulator-v1.19.8.jar...
Progress: ==========================================================================================================================================================================================> (100% of 64MB
i  firestore: Removing outdated emulator files: cloud-firestore-emulator-v1.19.5.jar
i  storage: downloading cloud-storage-rules-runtime-v1.1.3.jar...
Progress: ==========================================================================================================================================================================================> (100% of 53MB
i  ui: downloading ui-v1.14.0.zip...

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

✔  Firebase initialization complete!
Progress: ===========================================================================>----------------------------------------------------------------------------------------------------------------- (40% of 4MB
```
