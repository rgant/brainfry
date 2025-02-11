# Firebase Emulator

Emulator is used for local testing. Sometimes that can result in slow tests if
the emulator doesn't perform quickly. Keep an eye on that as our default timeout
for jasmine tests is 250ms and we report any tests slower than 100ms. See [karma.conf.js](/karma.conf.js) for details.

# Fixture data

Firebase Emulator data is stored in `fixtures/firebase-emulator/`. The `npm` scripts
for running the tests ensure that the emulator is launched before running `ng test`.

Export new test data using the `npm run test:export` command and accessing the
[emulator UI](http://127.0.0.1:4000/) to directly manage the data.

> [!NOTE]
> Exporting the data will modify many files in the `firebase-emulator` directory,
> and that may result in tests failing. It is probably safest to only commit
> those changes that you know are part of edits. Other files (storage blobs get
> renamed each export it appears) should be reverted: `git restore --source=HEAD --staged --worktree -- fixtures/firebase-emulator/storage_export`.
