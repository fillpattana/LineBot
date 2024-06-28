var Storage = require("../initializeStorage");
const admin = require("firebase-admin");
const axios = require("axios");

async function extractFileBinaryFromStorage(publicURL) {
  console.log("Entered get binary from storage");
  try {
    const response = await axios.get(publicURL, {
      responseType: "arraybuffer",
    });

    const binaryArray = new Uint8Array(response.data);

    return binaryArray;
  } catch (error) {
    console.error("Error fetching image:", error);
    throw error;
  }
}

async function deleteGroupByIdStorage(events) {
  const storageBucket = Storage.storage.bucket(Storage.bucketName);
  const groupDirectory = storageBucket.getFiles({
    prefix: `${events.source.groupId}/`,
  });

  groupDirectory
    .then(([files]) => {
      const deletePromises = files.map((file) => file.delete());
      return Promise.all(deletePromises);
    })
    .then(() => {
      console.log("Files deleted successfully");
    })
    .catch((err) => {
      console.error("Error deleting files:", err);
    });
}

module.exports = { extractFileBinaryFromStorage, deleteGroupByIdStorage };
