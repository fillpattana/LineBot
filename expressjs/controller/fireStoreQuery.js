var Storage = require('../initializeStorage');
var Getter = require('./Getter');

async function addSenderNameToJsonByUserId(Objects) {
    for (let Obj of Objects) {
        let userName = await Getter.getSenderName(Obj.groupId, Obj.userId);
        Obj.senderName = userName;
    }
    return Objects;
}

async function getTextByEventsFireStore(events){
    return Storage.lineTextDB.where("groupId", "==", events.source.groupId)
}

async function getFileByEventsFireStore(events){
    return Storage.lineFileDB.where("groupId", "==", events.source.groupId)
}

async function deleteGroupByIdFirestore(events){

    let textCollection = await getTextByEventsFireStore(events);
    if (!textCollection.empty) {
        await textCollection.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                doc.ref.delete();
            });
        });
    } else {
        console.log("Text collection is empty");
    }

    let fileCollection = await getFileByEventsFireStore(events);
    if (!fileCollection.empty) {
        await fileCollection.get().then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                doc.ref.delete();
            });
        });
    } else {
        console.log("File collection is empty");
    }
}

async function deleteGroupByIdStorage(events){
    const storageBucket = Storage.storage.bucket(Storage.bucketName);
        const groupDirectory = storageBucket.getFiles({ prefix: `${events.source.groupId}/` });

        groupDirectory
        .then(([files]) => {
            const deletePromises = files.map(file => file.delete());
            return Promise.all(deletePromises);
        })
        .then(() => {
            console.log('Files deleted successfully');
        })
        .catch(err => {
            console.error('Error deleting files:', err);
        });
}

async function getTextByGroupIdForGemini(groupId){
    let text = await getTextOrderByAsc(groupId)
    text = await addSenderNameToJsonByUserId(text)
    const messageCollection = await combineMessage(text)
    return messageCollection
}

async function getFileByGroupIdForGemini(groupId){
    let file = await getFileOrderByAsc(groupId)
    file = await addSenderNameToJsonByUserId(file)
    let fileCollection = await extractImagePublicURLsforGemini(file)
    return fileCollection
}

async function combineMessage(text) {
    let messages = "";
    text.forEach(function(message) {
        messages += message.senderName + " กล่าวว่า: " + message.msgContent + "\n";
    });
    return messages;
}

async function extractImagePublicURLsforGemini(Object) {
    console.log("Entered creating array of publicURLs")
    let publicURLs = [];
    // Iterate through the array of file/text objects from firestore
    Object.forEach(obj => {
      // Filter for messageType image
      if (obj.messageType === 'image') {
        // Push the publicURL value into the publicURLs array
        publicURLs.push(obj.publicUrl);
      }
    });
    return publicURLs;
}

async function getTextOrderByAsc(groupId){
    const querySnapshot = await Storage.lineTextDB
        .where("groupId", "==", groupId)
        .orderBy("timestamp", "asc")
        .get();
    const texts = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        texts.push({...data});
    });
    return texts;
}

async function getFileOrderByAsc(groupId){
    const querySnapshot = await Storage.lineFileDB
        .where("groupId", "==", groupId)
        .orderBy("timestamp", "asc")
        .get();
    const texts = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        texts.push({...data});
    });
    return texts;
}

module.exports = {deleteGroupByIdFirestore, deleteGroupByIdStorage, 
    getTextByEventsFireStore, getFileByEventsFireStore, addSenderNameToJsonByUserId,
    combineMessage, getTextByGroupIdForGemini, extractImagePublicURLsforGemini, 
    getFileByGroupIdForGemini, getTextOrderByAsc, getFileOrderByAsc}