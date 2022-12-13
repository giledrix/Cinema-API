const axios = require('axios');

// get all movies from my movies web service
const getAllMoviesFromWebService = function () {
    return axios.get("http://localhost:8000/api/movies"); 
}

// get specific movie from my movies web service
const getMovie = function (movieID) {
    return axios.get("http://localhost:8000/api/movies/" + movieID); 
}


// using post verb for add movie to web service
const addNewMovie = async function (obj) {

    let result = await axios.post('http://localhost:8000/api/movies', { Name: obj.Name, Genres: obj.Genres, Image: obj.Image, Premiered: obj.Premiered });

    return result.data;
}

// using delete verb - delete movie from web service
const deleteMovie = async function (id) {

    let result = await axios.delete('http://localhost:8000/api/movies/' + id);

    return result.data;
}

//using put verb to update movie data in web service
const updateMovie = async function (obj, movieID) {

    let result = await axios.put('http://localhost:8000/api/movies/' + movieID, { Name: obj.Name, Genres: obj.Genres, Image: obj.Image, Premiered: obj.Premiered });

    return result.data;
}


module.exports = { getAllMoviesFromWebService, addNewMovie, deleteMovie, getMovie, updateMovie };