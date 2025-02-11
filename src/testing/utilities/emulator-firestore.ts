import type { EnvironmentProviders } from '@angular/core';
import { connectFirestoreEmulator, getFirestore, provideFirestore } from '@angular/fire/firestore';
import type { Firestore } from '@angular/fire/firestore';

import firebaseSettings from '../../../firebase.json';

let firestoreEmulatorConnected = false;

export const provideEmulatedFirestore = (): EnvironmentProviders =>
  provideFirestore((): Firestore => {
    const firestore = getFirestore();

    // Connecting to the emulator multiple times for each TestBed.configureTestingModule call causes
    // errors, but only connecting once, hopefully fixes that.
    // https://np.reddit.com/r/Firebase/comments/18s6wzp/comment/kf6w7hk/
    if (!firestoreEmulatorConnected) {
      const { port } = firebaseSettings.emulators.firestore;
      connectFirestoreEmulator(firestore, 'localhost', port);
      firestoreEmulatorConnected = true;
    }

    return firestore;
  });
