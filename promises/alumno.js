/**
 * 
 */

 var io = require('socket.io-client');

 var Chance = require('chance');

 var chance = new Chance(); 

 var socket = require('socket.io-client')('http://localhost:8080/alumnos');

 var RandomTimer = require("./../timer.js");

 var timer = new RandomTimer(3000, 5000);

 
 
function crearPregunta() { 

    return new Promise(function(resolve, reject){

        process.nextTick(function() {

            resolve(chance.sentence({words: 5})); 

        }); 

    }); 

}


function enviarPregunta(texto) {  

    return new Promise(function(resolve, reject) {
        
        socket.emit('nueva_pregunta', texto, function(err, data){

            if(err)
                reject(err.message); 

            else 
                resolve(data); 

        }); 

    }); 

}

socket.on('connect', function() {

    console.log("connectado a servidor");
    
    timer.on('tick', function() {

        crearPregunta()       
        .then(enviarPregunta)
        .then(console.log)
        .catch(console.log);
        
    });

});

// cuando hay una nueva pregunta en la lista

socket.on('nueva_pregunta_en_lista', function(pregunta) {

    console.log("nueva_pregunta_en_lista: --> " + JSON.stringify(pregunta));

});

// cuando hay una nueva respuesta en la lista

socket.on('nueva_respuesta_a_pregunta', function(pregunta_con_respuesta) {

    console.log("nueva respuesta a pregunta: --> " + JSON
        .stringify(pregunta_con_respuesta));

});

