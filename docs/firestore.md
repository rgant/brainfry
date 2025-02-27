# Firestore Database

Firestore configurations are stored in [`firestore.rules`](/firestore.rules) and
[`firestore.indexes.json`](/firestore.indexes.json).

To update these in production, run `firebase deploy --only firestore` which uses
those files to setup Firestore.

To update the indexes from production:

```sh
firebase firestore:indexes > firestore.indexes.json
```
