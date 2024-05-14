var Storage = require('../initializeStorage');
var Getter = require('./Getter');

async function getFileByGroupIdFireStore(groupId){
    const querySnapshot = await Storage.lineFileDB
        .where("groupId", "==", groupId)
        .get();
    const files = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const transformedTimestamp = transformTimestamp(data.timestamp);
        files.push({ ...data, transformedTimestamp });
    });
    files.sort((a, b) => a.transformedTimestamp.localeCompare(b.transformedTimestamp));
    return files;
}

async function getTextByGroupIdFireStore(groupId){
    const querySnapshot = await Storage.lineTextDB
        .where("groupId", "==", groupId)
        .get();
    const texts = [];
    querySnapshot.forEach(doc => {
        const data = doc.data();
        const transformedTimestamp = transformTimestamp(data.timestamp);
        texts.push({ ...data, transformedTimestamp });
    });
    texts.sort((a, b) => a.transformedTimestamp.localeCompare(b.transformedTimestamp));
    return texts;
}

function transformTimestamp(timestampString) {
    const [day, month, yearTime] = timestampString.split("/");
    const [year, time] = yearTime.split("-");
    const [hour, minute, second] = time.split(":");
    const monthMap = {
        "Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06",
        "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"
    };
    return `${year}-${monthMap[month]}-${day}T${hour}:${minute}:${second}`;
}

async function addSenderNameToJsonByUserId(Objects) {
    for (const Obj of Objects) {
        const userName = await Getter.getUserNameFromProfile(Obj.userId);
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

module.exports = {deleteGroupByIdFirestore, deleteGroupByIdStorage, 
    getTextByEventsFireStore, getFileByEventsFireStore,
    getFileByGroupIdFireStore, getTextByGroupIdFireStore, addSenderNameToJsonByUserId}