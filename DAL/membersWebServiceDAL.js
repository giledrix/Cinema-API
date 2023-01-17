const axios = require('axios');

// get all members from my movies web service
const getAllMembersFromWebService = function () {
    return axios.get("https://subscription-api.onrender.com/api/members");
}

// get specific member from my movies web service
const getMember = function (memberID) {
    return axios.get("https://subscription-api.onrender.com/api/members/" + memberID);
}


// using post verb to add member to web service
const addNewMember = async function (obj) {

    let result = await axios.post('https://subscription-api.onrender.com/api/members', { Name: obj.Name, Email: obj.Email, City: obj.City });

    return result.data;
}

//using put verb to update member data in web service
const updateMember = async function (obj, memberID) {

    let result = await axios.put('https://subscription-api.onrender.com/api/members/' + memberID, { Name: obj.Name, Email: obj.Email, City: obj.City });

    return result.data;
}

// using delete verb - delete member from web service
const deleteMember = async function (id) {

    let result = await axios.delete('https://subscription-api.onrender.com/api/members/' + id);

    return result.data;
}



module.exports = { getAllMembersFromWebService, getMember, updateMember ,addNewMember,deleteMember};
