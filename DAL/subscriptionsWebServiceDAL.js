const axios = require('axios');
const subscriptionsWS_url = "https://subscription-api.onrender.com/api/subscriptions"

const getTokenToSubscriptionWS = async function (id,timeout) {
    let  result = await axios.get(subscriptionsWS_url + "/getSubscriptionWSToken/" + id + "/" + timeout );
    return result.data;
}


// get all subscriptions from my subscriptions web service
const getAllSubscriptions = function () {
    return axios.get("https://subscription-api.onrender.com/api/subscriptions");
}

// get specific member from my subscriptions web service
const getSubscription = function (id) {
    return axios.get("https://subscription-api.onrender.com/api/subscriptions/" + id);
}

// using post verb to add member to web service
const createSubscription = async function (obj) {

    let result = await axios.post('https://subscription-api.onrender.com/api/subscriptions', { MemberID: obj.MemberID, Movies: obj.Movies });

    return result.data;
}

//using put verb to update member data in web service
const updateSubscription = async function (obj, memberID) {

    let result = await axios.put('https://subscription-api.onrender.com/api/subscriptions/' + memberID, { MemberID: obj.MemberID, Movies: obj.Movies });

    return result.data;
}

// using delete verb - delete member from web service
const deleteSubscription = async function (id) {

    let result = await axios.delete('https://subscription-api.onrender.com/api/subscriptions/' + id);

    return result.data;
}


module.exports = { getAllSubscriptions: getAllSubscriptions, getSubscription, updateSubscription: updateSubscription ,createSubscription,deleteSubscription,getTokenToSubscriptionWS};
