import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

export const getCollection = async (name: string) => {
  const snapshot = await getDocs(collection(db, name));

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
};

export const addRecord = async (
  collectionName: string,
  data: Record<string, unknown>
) => {
  const ref = await addDoc(collection(db, collectionName), data);

  return ref.id;
};

export const getRecord = async (
  collectionName: string,
  id: string
) => {
  const snapshot = await getDoc(doc(db, collectionName, id));

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const setRecord = async (
  collectionName: string,
  id: string,
  data: Record<string, unknown>
) => {
  await setDoc(doc(db, collectionName, id), data);
};

export const updateRecord = async (
  collectionName: string,
  id: string,
  data: Record<string, unknown>
) => {
  await updateDoc(doc(db, collectionName, id), data);
};

export const deleteRecord = async (
  collectionName: string,
  id: string
) => {
  await deleteDoc(doc(db, collectionName, id));
};