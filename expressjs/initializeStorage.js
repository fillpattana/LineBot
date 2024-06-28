const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAcount = require("./config.json");
const { Storage } = require("@google-cloud/storage");

initializeApp({
  credential: cert(serviceAcount),
});

const db = getFirestore();
const lineTextDB = db.collection("TextMessages");
const lineFileDB = db.collection("FileMessages");
const allGroupsDB = db.collection("AllGroups");
const gemResponse = db.collection("GeminiTextResponses");

const bucketName = process.env.BUCKET_NAME;
const storage = new Storage();

module.exports = {
  storage,
  bucketName,
  lineTextDB,
  lineFileDB,
  allGroupsDB,
  gemResponse
};
