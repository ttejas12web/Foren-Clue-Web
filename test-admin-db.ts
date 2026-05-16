import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
admin.initializeApp({ projectId: config.projectId });

async function run() {
  try {
    const db = getFirestore(admin.app(), config.firestoreDatabaseId);
    console.log("Got db.");
    await db.collection("test").doc("test").set({ a: 1 });
    console.log("Successfully wrote to specific db.");
  } catch (e) {
    console.error("Error writing via getFirestore:", e);
  }
}
run();
