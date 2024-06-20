// addEpochTimeStamp.js

const { lineTextDB } = require("../initializeStorage");
const moment = require("moment");

async function addEpochTimeStamp() {
  const snapshot = await lineTextDB.get();

  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }

  const batch = lineTextDB.firestore.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    const formattedTimeStamp = moment(data.timeStamp, "DD-MMMM-YYYY-HH:mm:ss").valueOf();
    batch.update(doc.ref, { formattedTimeStamp: formattedTimeStamp });
  });

  await batch.commit();
  console.log("Updated all documents with formattedTimeStamp.");
}

addEpochTimeStamp().catch(console.error);
