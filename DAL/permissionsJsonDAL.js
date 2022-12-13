const jFile = require('jsonfile'); // working with jsonfile

const filePath = "./DataSources/permissions.json";

const getAllPermissionsDataFromJsonFile = function () {
    return new Promise((resolve, reject) => {
        jFile.readFile(filePath, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

const writeTopermissionsJsonFile = function (obj) {
    return new Promise((resolve, reject) => {
        jFile.writeFile(filePath, obj, function (err) { // recived file path , data to store , and callback function for errors

            if (err) {
                reject(err);
            }
            else {
                resolve('updated!'); // return status
            }
        });
    });
}


module.exports = { getAllPermissionsDataFromJsonFile, writeTopermissionsJsonFile };