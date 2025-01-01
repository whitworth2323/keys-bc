import { NextRequest, NextResponse } from 'next/server';
import { customInitApp } from '../../../../../lib/firebase-admin-config';
import { Firestore, FieldValue } from 'firebase-admin/firestore';
import { firestore } from 'firebase-admin';
customInitApp();

async function fetchLicenseKeys(keyIds: string[]) {
  // Fetch license keys for each keyId

  const firestoreInstance = firestore();
  const licenseKeysPromises = keyIds.map(async keyId => {
    const docRef = firestoreInstance.collection('keys').doc(keyId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return docSnap?.data()?.license_key;
    } else {
      console.log(`No such document`);
      return null;
    }
  });

  const licenseKeys = await Promise.all(licenseKeysPromises);

  // Filter out null values (in case some keys were not found)
  const filteredLicenseKeys = licenseKeys.filter(key => key !== null);

  return filteredLicenseKeys;
}

async function fetchNewKeys(numKeys: number) {
  const url = process.env.NEXT_PUBLIC_CLOUD_FUNCTION_URL + '/generateKeys';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ numKeys }),
  });
  const data = await response.json();
  const keys: string[] = data.keyIds; // Explicitly type keyIds as an array of strings
  const licenseKeys = await fetchLicenseKeys(keys);
  return licenseKeys;
}

async function generateNKeyAppSumo(
  n: number,
): Promise<{ license_key: string }[]> {
  let keys: { license_key: string }[] = [];
  try {
    // Generate keys
    const newKeys = await fetchNewKeys(n);

    for (let i = 0; i < n; i++) {
      const insertionObject = {
        date_created: FieldValue.serverTimestamp(),
        license_key: newKeys[i],
        license_type: 'App_Sumo_5_site',
      };

      keys.push({
        license_key: insertionObject.license_key,
      });
    }

    const keysToReturn = keys.map(key => {
      return { license_key: key.license_key };
    });

    console.log('pt1');

    return keysToReturn;
  } catch (err) {
    console.log(err);
    throw new Error('Error in generating keys');
  }
}

export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const body = await request.json();
    const { numKeys } = body;
    const keys = await generateNKeyAppSumo(numKeys);
    return NextResponse.json({ keys }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 501 });
  }
}

export const maxDuration = 120;

