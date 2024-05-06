var Storage = require('../initializeStorage');

async function getByGroupIdFireStore(events){
    return Storage.lineMessageDB.where("groupId", "==", events.source.groupId)
}

async function deleteGroupByIdFirestore(events){
    let collection = await getByGroupIdFireStore(events)
    await collection.get().then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
            doc.ref.delete();
        });
    });
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

module.exports = {deleteGroupByIdFirestore, deleteGroupByIdStorage}