const { lineTextDB } = require("../initializeStorage");
const moment = require("moment-timezone");

async function addEpochTimeStamp() {
  const snapshot = await lineTextDB.get();

  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }

  const batch = lineTextDB.firestore.batch();

  snapshot.forEach((doc) => {
    const data = doc.data();
    let timeStamp = data.timeStamp;

    // Extract the hour part from the timestamp
    const hour = parseInt(timeStamp.split('-')[3].split(':')[0]);

    // Check if the hour part indicates PM times
    if (hour >= 1 && hour < 12) {
      timeStamp += ' PM';
    } else if (hour === 12) {
      timeStamp += ' PM';
    } else {
      timeStamp += ' AM';
    }

    // Parse the timestamp in Bangkok timezone
    const formattedTimeStamp = moment.tz(timeStamp, "DD-MMMM-YYYY-h:mm:ss A", "Asia/Bangkok").valueOf();
    batch.update(doc.ref, { formattedTimeStamp: formattedTimeStamp });
  });

  await batch.commit();
  console.log("Updated all documents with formattedTimeStamp.");
}

addEpochTimeStamp().catch(console.error);
