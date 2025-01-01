import { NextRequest, NextResponse } from 'next/server';
// import { customInitApp } from '../../../../../lib/firebase-admin-config';
// import { Firestore } from 'firebase-admin/firestore';
import { firestore } from 'firebase-admin';
import { stringify } from 'csv-stringify/sync';
// var serviceAccount = require('@/../utils/adminsdk.json');
// var admin = require('firebase-admin');
// import { initializeApp, credential } from 'firebase-admin';
import { customInitApp } from '../../../../../lib/firebase-admin-config';

customInitApp();

function checkIfDateIsValid(
  date: { _seconds: number; _nanoseconds: number } | string,
) {
  if (typeof date === 'string') {
    return date;
  }

  try {
    const dateObject = new Date(
      date._seconds * 1000 + date._nanoseconds / 1000000,
    );

    const dateStr = dateObject.toISOString();

    return dateStr;
  } catch {
    console.error('Error in Parsing Date Object');
    return ''; // * Returning empty string if date is invalid
  }
}

async function generateNumbersReport() {
  const firestoreInstance = firestore();

  const keysCollection = firestoreInstance.collection('keys');

  const keysDocs = await keysCollection.get();
  const keys = keysDocs.docs.map(doc => ({
    ...doc.data(),
    date_created: checkIfDateIsValid(doc.data().date_created),
    site_1_timestamp: checkIfDateIsValid(doc.data().site_1_timestamp),
    site_2_timestamp: checkIfDateIsValid(doc.data().site_2_timestamp),
    site_3_timestamp: checkIfDateIsValid(doc.data().site_3_timestamp),
    site_4_timestamp: checkIfDateIsValid(doc.data().site_4_timestamp),
    site_5_timestamp: checkIfDateIsValid(doc.data().site_5_timestamp),
  }));

  const columns = [
    { key: 'license_key', header: 'License Key' },
    { key: 'date_created', header: 'Date Created' },
    { key: 'license_type', header: 'License Type' },
    { key: 'site_1', header: 'Site 1' },
    { key: 'site_1_timestamp', header: 'Site 1 Timestamp' },
    { key: 'site_2', header: 'Site 2' },
    { key: 'site_2_timestamp', header: 'Site 2 Timestamp' },
    { key: 'site_3', header: 'Site 3' },
    { key: 'site_3_timestamp', header: 'Site 3 Timestamp' },
    { key: 'site_4', header: 'Site 4' },
    { key: 'site_4_timestamp', header: 'Site 4 Timestamp' },
    { key: 'site_5', header: 'Site 5' },
    { key: 'site_5_timestamp', header: 'Site 5 Timestamp' },
  ];

  const csv = stringify(keys, { header: true, columns: columns });
  return csv;
}

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const csv = await generateNumbersReport();

    return NextResponse.json({ csv }, { status: 200 });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json({ error: err.message }, { status: 501 });
  }
}

export const revalidate = 0;
export const maxDuration = 120;

