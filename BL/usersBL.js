const UsersModel = require('../Models/usersModel');
const usersJsonDAL = require('../DAL/usersJsonDAL');
const permissionJsonDAL = require('../DAL/permissionsJsonDAL');
const subscriptionsWebServiceDAL = require('../DAL/subscriptionsWebServiceDAL');

const jwt = require('jsonwebtoken');
const RSA_PRIVATE_KEY = 'secretkey';

const getAllUsers = function () {
    return new Promise((resolve, reject) => {
        UsersModel.find({}, function (err, users) {
            if (err) {
                reject(err);
            }
            else {
                resolve(users);
            }
        });
    });
}

const getAllUsersDataFromAllSources = async function () {
    return new Promise((resolve, reject) => {
        UsersModel.find({}, async function (err, users) { // get all user data from db
            if (err) {
                reject(err)
            }
            else {
                let finalData = {};
                let usersDataArr = [];
                let respFromUsersJsonFile, respFromPermissionJsonFile;

                try {
                    respFromUsersJsonFile = await usersJsonDAL.getAllUsersData(); // get all user personal data from userJSON file
                    respFromPermissionJsonFile = await permissionJsonDAL.getAllPermissionsDataFromJsonFile(); // get all user permission from permissionJSON file 
                }
                catch (err) {
                    cd("Load all users and permission from JSON files is failed , error : " + err);
                    resolve("Load all users and permission from JSON files is failed , error : " + err);
                }

                // data shaping from all data sources (DB, JSON files)
                users.forEach(user => {
                    respFromUsersJsonFile.users.forEach(userJson => {
                        respFromPermissionJsonFile.permissions.forEach(permissionsJson => {

                            if (user._id == userJson.id && user._id == permissionsJson.id) {
                                let userData = {
                                    id: user._id,
                                    username: user.Username,
                                    password: user.Password,
                                    firstName: userJson.firstName,
                                    lastName: userJson.lastName,
                                    classification: user.Classification,
                                    sessionTimeOut: userJson.sessionTimeOut,
                                    createdDate: userJson.createdDate,
                                    permissions: permissionsJson.permissions
                                }
                                usersDataArr.push(userData);
                            }
                        });
                    });
                });

                finalData.users = usersDataArr;

                resolve(finalData);
            }
        });
    });

}


const loginValidation = async function (username, password) {

    return new Promise((resolve, reject) => {
        UsersModel.find({}, async function (err, users) { // get all users;
            if (err) {
                reject(err)
            }
            else {


                let user = users.find(user => user.Username == username); // get specific user by username

                if (user) { // if user is found
                    if (user.Password == password) { // check if password correct
                        let usersDetailed = await usersJsonDAL.getAllUsersData(); // get all users personal data (for present name)
                        let userPermissions = await permissionJsonDAL.getAllPermissionsDataFromJsonFile(); // get all users permissions data

                        if (usersDetailed) { // if found
                            let userData = usersDetailed.users.find(x => x.id == user._id); // get specific user by id
                            let userPermList = userPermissions.permissions.find(p => p.id == user.id) // get specific user permissions by id
                            let sessionTimeOut = userData.sessionTimeOut * 60000 // session timeout in milliseconds

                            // JWT for Cinema Web Service
                            var tokenData = jwt.sign({ id: user._id },
                                RSA_PRIVATE_KEY,
                                { expiresIn: sessionTimeOut } // expires time
                            );

                            // JWT for Subscriptions   Web Service
                            let subscriptionWSToken = await subscriptionsWebServiceDAL.getTokenToSubscriptionWS(user._id, sessionTimeOut);

                            //Data shaping
                            let finalUserData = {
                                id: user._id,
                                username: user.Username,
                                password: user.Password,
                                classification: user.Classification,
                                name: userData.firstName + " " + userData.lastName,
                                permissions: userPermList.permissions,
                                timeOut: sessionTimeOut,
                                tokenCinemaWS: tokenData,
                                tokenSubscriptionWS: subscriptionWSToken
                            };
                            resolve(finalUserData); // return user data 
                        }
                        else {
                            resolve("Error loading data from users Json File...");
                        }

                    }
                    else {
                        console.log(user.Username + " Insert wrong Password..");
                        resolve("Password incorrect");
                    }

                }
                else {
                    console.log("User is not exist");
                    resolve("User is not exist");
                }
            }
        });
    });
}

const completeRegister = async function (username, password) {

    return new Promise((resolve, reject) => {
        UsersModel.find({ Username: username }, async function (err, user) { // get user from DB (by username)
            if (err) {
                reject(err);
            }
            else {

                if (user.length > 0) { // if user is found 
                    if (!user[0].Password) { // If the user does not have a password
                        UsersModel.findByIdAndUpdate(user[0]._id, { Password: password }, function (err) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve("Password set");
                            }

                        })
                    }
                    else {
                        resolve("Password Already set"); // if user already set password before
                    }

                }
                else {
                    console.log("User is not exist");
                    resolve("User is not exist");
                }

            }
        });
    });
}

const adminCreateNewUser = async function (input) {

    return new Promise((resolve, reject) => {

        UsersModel.find({ Username: input.username }, async function (err, user) { // Check if user exists in DB
            if (err) {
                reject(err);
            }
            else {
                console.log(user);

                if (user.length == 0) { // if not found

                    const newUser = new UsersModel({ // Create instance of User db schema
                        Username: input.username,
                        Classification: input.classification
                    });

                    newUser.save(function (err) { // Save in DB using built-in function (save)
                        if (err) {
                            reject(err);
                        }
                        else {
                            UsersModel.find({ Username: input.username }, async function (err, userRes) { // Check if user exists in DB
                                if (err) {
                                    reject(err);
                                }
                                else {
                                    let userID = userRes[0]._id;

                                    // update in userJSON AND permissionJSON
                                    let finalUserJson = {};
                                    let finalPermissionsJson = {};
                                    let respFromUserJSON, respFromPermissionsJSON;

                                    try {
                                        respFromUserJSON = await usersJsonDAL.getAllUsersData();
                                        respFromPermissionsJSON = await permissionJsonDAL.getAllPermissionsDataFromJsonFile();
                                    }
                                    catch (err) {
                                        resolve("get user data is failed " + err);
                                    }
                                    let allUserJsonArr = respFromUserJSON.users;
                                    let permissionsJsonArr = respFromPermissionsJSON.permissions;

                                    // userJSON data shaping
                                    let user = {
                                        id: userID,
                                        firstName: input.fname,
                                        lastName: input.lname,
                                        createdDate: new Date().toLocaleDateString(),
                                        sessionTimeOut: input.sessionTimeout
                                    }

                                    allUserJsonArr.push(user);
                                    finalUserJson.users = allUserJsonArr;

                                    // Permissions Data shaping
                                    let userPermissions = {
                                        id: userID,
                                        permissions: input.permissions
                                    }


                                    userPermissions.permissions = userPermissions.permissions.filter(perm => perm != null); // clean null values from permissions

                                    permissionsJsonArr.push(userPermissions);
                                    finalPermissionsJson.permissions = permissionsJsonArr;

                                    let result1, result2;
                                    try {
                                        result1 = await usersJsonDAL.writeToUserJsonFile(finalUserJson); // update in userJSON file
                                        result2 = await permissionJsonDAL.writeToPermissionsJsonFile(finalPermissionsJson); // update data in permissionsJSON file

                                    }
                                    catch (err) {
                                        resolve("update user data failed" + err);
                                    }

                                    if (result1 == "updated!" && result2 == "updated!") {
                                        resolve('OK');
                                    }
                                    else {
                                        resolve("Create user is failed!");
                                    }

                                }
                            });

                        }
                    });

                }
                else {
                    console.log(input.username + " already register in the system");
                    resolve('Username already exists');
                }
            }
        }
        )
    });
}

const updateUserData = async function (input) {
    return new Promise((resolve, reject) => {

        // update in DB
        UsersModel.findByIdAndUpdate(input.id, { Username: input.username, Classification: input.classification }, async function (err) {
            if (err) {
                reject(err);
            }
            else {
                // update in userJSON AND permissionJSON
                let finalUserJson = {};
                let finalPermissionsJson = {};
                let respFromUserJSON, respFromPermissionsJSON;

                try {
                    respFromUserJSON = await usersJsonDAL.getAllUsersData();
                    respFromPermissionsJSON = await permissionJsonDAL.getAllPermissionsDataFromJsonFile();
                }
                catch (err) {
                    resolve("get user data is failed " + err);
                }
                let allUserJsonArr = respFromUserJSON.users;
                let permissionsJsonArr = respFromPermissionsJSON.permissions;

                // userJSON data shaping
                allUserJsonArr.forEach(user => {
                    if (user.id == input.id) {
                        user.firstName = input.firstName,
                            user.lastName = input.lastName,
                            user.sessionTimeOut = parseInt(input.sessionTimeout)
                    }

                });

                finalUserJson.users = allUserJsonArr;

                // Permissions Data shaping
                let permissions = input.permissions
                permissions = permissions.filter(genre => genre != null); // clean null values from permissions

                permissionsJsonArr.forEach(per => {
                    if (per.id == input.id) {
                        per.permissions = permissions
                    }
                });

                finalPermissionsJson.permissions = permissionsJsonArr;

                let result1, result2;
                try {
                    result1 = await usersJsonDAL.writeToUserJsonFile(finalUserJson); // update in userJSON file
                    result2 = await permissionJsonDAL.writeToPermissionsJsonFile(finalPermissionsJson); // update data in permissionsJSON file

                }
                catch (err) {
                    resolve("update user data failed" + err);
                }

                if (result1 == "updated!" && result2 == "updated!") {
                    resolve('OK');
                }
                else {
                    resolve("update user is failed!");
                }
            }
        }
        )
    });
}

const deleteUser = async function (userID) {

    return new Promise((resolve, reject) => {
        UsersModel.findByIdAndDelete(userID, async function (err) { // find user by id and delete him
            if (err) {
                reject(err)
            }
            else { // if user find

                let userJsonFinalData = {};
                let permissionsJsonFinalData = {};
                let resp1, resp2;

                try {
                    // get personal data from user JSON
                    resp1 = await usersJsonDAL.getAllUsersData();
                    // get user permissions data from permissions JSON
                    resp2 = await permissionJsonDAL.getAllPermissionsDataFromJsonFile();
                }
                catch (err) {
                    return (err);
                }

                let allUsersJson = resp1.users;
                let allPermissionsJson = resp2.permissions;



                //delete user personal data
                for (let [i, user] of allUsersJson.entries()) {
                    if (user.id == userID) {
                        allUsersJson.splice(i, 1);
                    }
                }

                //delete permission user data
                for (let [i, user] of allPermissionsJson.entries()) {
                    if (user.id == userID) {
                        allPermissionsJson.splice(i, 1);
                    }
                }

                userJsonFinalData.users = allUsersJson;
                permissionsJsonFinalData.permissions = allPermissionsJson;

                let result1, result2;

                //update changes in JSON file
                try {
                    result1 = await usersJsonDAL.writeToUserJsonFile(userJsonFinalData);
                    result2 = await permissionJsonDAL.writeToPermissionsJsonFile(permissionsJsonFinalData);
                }
                catch (err) {
                    console.log(err);
                    resolve("delete user failed");
                }

                if (result1 == "updated!" && result2 == "updated!") {
                    resolve('OK');
                }

            }
        });
    });

}


module.exports = { getAllUsers, loginValidation, completeRegister, adminCreateNewUser, updateUserData, deleteUser, getAllUsersDataFromAllSources };