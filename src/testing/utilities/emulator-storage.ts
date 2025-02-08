import type { EnvironmentProviders } from '@angular/core';
import { connectStorageEmulator, getStorage, provideStorage } from '@angular/fire/storage';
import type { FirebaseStorage } from '@angular/fire/storage';

import firebaseSettings from '../../../firebase.json';

let storageEmulatorConnected = false;

export const provideEmulatedStorage = (): EnvironmentProviders =>
  provideStorage((): FirebaseStorage => {
    const storage = getStorage();

    // Connecting to the emulator multiple times for each TestBed.configureTestingModule call causes
    // errors, but only connecting once, hopefully fixes that.
    // https://np.reddit.com/r/Firebase/comments/18s6wzp/comment/kf6w7hk/
    if (!storageEmulatorConnected) {
      const { port } = firebaseSettings.emulators.storage;
      connectStorageEmulator(storage, 'localhost', port);
      storageEmulatorConnected = true;
    }

    return storage;
  });
