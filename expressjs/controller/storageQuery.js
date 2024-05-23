var Storage = require('../initializeStorage')
const admin = require('firebase-admin');
const axios = require('axios')

async function extractFileBinaryFromStorage(publicURL) {
  console.log("Entered get binary from storage")
    try {
      const response = await axios.get(publicURL, {
        responseType: 'arraybuffer'
      });
  
      const binaryArray = new Uint8Array(response.data);
  
      return binaryArray;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  }

module.exports = {extractFileBinaryFromStorage}