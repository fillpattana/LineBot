const { lineTextDB } = require("../initializeStorage");
const { FieldValue } = require('firebase-admin/firestore');

async function removeFormattedTimeStamp() {
  const snapshot = await lineTextDB.get();

  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }

  const batch = lineTextDB.firestore.batch();

  snapshot.forEach((doc) => {
    batch.update(doc.ref, { formattedTimeStamp: FieldValue.delete() });
  });

  await batch.commit();
  console.log("Removed formattedTimeStamp field from all documents.");
}

removeFormattedTimeStamp().catch(console.error);
