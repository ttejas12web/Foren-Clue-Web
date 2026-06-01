import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import fs from 'fs';

async function testFetch() {
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const querySnapshot = await getDocs(collection(db, "cases"));
  querySnapshot.forEach((doc) => {
    console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
  });
}
testFetch().catch(console.log);
