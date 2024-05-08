var Storage = require('../initializeStorage');
var Getter = require('./Getter');

// async function getTextByGroupIdFireStore (groupId) {
//     const textCollection = Storage.lineTextDB.where("groupId", "==", groupId);
//     if (!textCollection.empty) {
//         await textCollection.get().then(function (querySnapshot) {
//             querySnapshot.forEach(function (doc) {
//                 console.log(doc.id, " => ", doc.data());
//             });
//         });
//     } else {
//         console.log("Text collection is empty");
//     }
// }

// async function getTextByGroupIdFireStore(groupId) {
//     const querySnapshot = await Storage.lineTextDB.where("groupId", "==", groupId).get();
//     const texts = [];
//     querySnapshot.forEach(doc => {
//         texts.push(doc.data());
//     });
//     return texts;
// }

async function getFileByGroupIdFireStore(groupId){
    const querySnapshot = await Storage.lineFileDB.where("groupId", "==", groupId).get();
    const files = [];
    querySnapshot.forEach(doc => {
        files.push(doc.data());
    });
    return files
}

async function getTextByGroupIdFireStore(groupId){
    const querySnapshot = await Storage.lineTextDB.where("groupId", "==", groupId).get();
    const texts = [];
    querySnapshot.forEach(doc => {
        texts.push(doc.data());
    });
    return texts
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

    // Get file collection
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

            // Wait for all delete operations to complete
            return Promise.all(deletePromises);
        })
        .then(() => {
            console.log('Files deleted successfully');
        })
        .catch(err => {
            console.error('Error deleting files:', err);
        });
}

module.exports = {deleteGroupByIdFirestore, deleteGroupByIdStorage, 
    getTextByEventsFireStore, getFileByEventsFireStore,
    getFileByGroupIdFireStore, getTextByGroupIdFireStore}