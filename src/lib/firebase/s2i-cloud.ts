import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import type { DB } from "../domain/types";

const STATE_COLLECTION = "s2i_state";
const STATE_DOCUMENT = "demo";

export async function saveCloudState(state: DB) {
  try {
    await setDoc(
      doc(db, STATE_COLLECTION, STATE_DOCUMENT),
      {
        ...state,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    console.log("S2I cloud state saved");
  } catch (error) {
    console.error("Failed to save S2I cloud state:", error);
  }
}

export async function loadCloudState(): Promise<DB | null> {
  try {
    const snapshot = await getDoc(
      doc(db, STATE_COLLECTION, STATE_DOCUMENT),
    );

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    const { updatedAt: _updatedAt, ...state } = data;

    return state as DB;
  } catch (error) {
    console.error("Failed to load S2I cloud state:", error);
    return null;
  }
}