const {initializeApp, cert} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const serviceAcount = require('./config.json')

initializeApp({
    credential: cert(serviceAcount)
})

const {Storage} = require('@google-cloud/storage');

const db = getFirestore();
const lineMessageDB = db.collection("Messages");
const bucketName = process.env.BUCKET_NAME;
const storage = new Storage();

module.exports = {storage}