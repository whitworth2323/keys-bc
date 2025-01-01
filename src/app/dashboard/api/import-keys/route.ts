import { NextRequest, NextResponse } from 'next/server';
import { firestore } from 'firebase-admin';
import { customInitApp } from '../../../../../lib/firebase-admin-config';
import { parse } from 'path';

customInitApp();

async function checkIfAlreadyExists(key: string) {
  try {
    const firestoreInstance = firestore();
    const keysCollection = firestoreInstance.collection('keys');
    const keyDoc = await keysCollection.where('license_key', '==', key).get();
    return !keyDoc.empty;
  } catch (err) {
    console.log('Error in checkIfAlreadyExists');
    console.error(err);
    throw new Error('Error in checkIfAlreadyExists');
  }
}

function validateDate(date: string) {
  let dateCreated: any = new Date(date);

  if (isNaN(dateCreated.getTime())) {
    console.error(`Invalid date: ${date}`);
    return '';
  }

  return firestore.Timestamp.fromDate(dateCreated);
}

async function addKeysToFirestore(keys: Keys[]) {
  try {
    const keysInfo = {
      accepted: 0,
      rejected: 0,
    };

    const firestoreInstance = firestore();
    const keysCollection = firestoreInstance.collection('keys');

    // * Using transaction to ensure atomicity
    await firestoreInstance.runTransaction(async transaction => {
      const keysSnapshot = await keysCollection.get();

      // * Delete all existing keys
      console.log('Deleting existing keys.');
      keysSnapshot.forEach(doc => {
        transaction.delete(doc.ref);
      });

      // * Insert new keys
      console.log('Inserting keys.');
      await Promise.all(
        keys.map(async key => {
          const keyDoc = keysCollection.doc();

          let dateCreated: any = new Date(key.date_created);

          if (isNaN(dateCreated.getTime())) {
            console.error(`Invalid date: ${key.date_created}`);
            dateCreated = null;
          } else {
            dateCreated = firestore.Timestamp.fromDate(dateCreated);
          }

          const insertionObject = {
            date_created: dateCreated || firestore.FieldValue.serverTimestamp(),
            license_key: key.license_key,
            license_type: key.license_type,
            site_1: key.site_1,
            site_1_timestamp: validateDate(key.site_1_timestamp),
            site_2: key.site_2,
            site_2_timestamp: validateDate(key.site_2_timestamp),
            site_3: key.site_3,
            site_3_timestamp: validateDate(key.site_3_timestamp),
            site_4: key.site_4,
            site_4_timestamp: validateDate(key.site_4_timestamp),
            site_5: key.site_5,
            site_5_timestamp: validateDate(key.site_5_timestamp),
          };
          transaction.set(keyDoc, insertionObject);
        }),
      );
    });
  } catch (err) {
    console.log('Error in addKeysToFirestore');
    console.error(err);
    throw new Error('Error in addKeysToFirestore');
  }
}

function validateKeys(keys: Keys[]) {
  const regex = /^[a-f0-9]{4}-[a-f0-9]{8}-[a-f0-9]{8}-[a-f0-9]{8}$/;

  const validatedKeysInfo = {
    accepted: 0,
    rejected: 0,
  };

  const validatedKeys = keys.filter(key => {
    if (!regex.test(key.license_key)) {
      console.error('Invalid Key:', key.license_key);
      validatedKeysInfo.rejected += 1;
      return false;
    }
    validatedKeysInfo.accepted += 1;
    return true;
  });

  console.log({ validatedKeysInfo });
  return { validatedKeys, validatedKeysInfo };
}

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const body = await request.json();
    const keys: Keys[] = body.keys;

    const { validatedKeys, validatedKeysInfo } = validateKeys(keys);

    if (validatedKeys.length === 0) {
      return NextResponse.json({ validatedKeysInfo }, { status: 400 });
    }

    await addKeysToFirestore(validatedKeys);

    return NextResponse.json({ validatedKeysInfo }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 501 });
  }
}

type Keys = {
  license_key: string;
  date_created: string;
  license_type: string;
  site_1: string;
  site_1_timestamp: string;
  site_2: string;
  site_2_timestamp: string;
  site_3: string;
  site_3_timestamp: string;
  site_4: string;
  site_4_timestamp: string;
  site_5: string;
  site_5_timestamp: string;
};

export const maxDuration = 120;

