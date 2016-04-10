/**
 * 
 */

'use strict';

var io = require('socket.io-client');

var chance = require('chance')();

var socket = require('socket.io-client')('http://localhost:8080/alumnos');

var RandomTimer = require("./../timer.js");

var timer = new RandomTimer(3000, 5000);

// cuando un alumno se conecta a la lista ...

socket.on('connect', function() {

    console.log("connectado a servidor");

    // envia preguntas aleatoriamente

    /*timer.on('tick', function() {
        socket.emit("nueva_pregunta", {
            texto: chance.sentence({
                words: 10
            })
        });

    });*/
    function nuevaPregunta(){
        socket.emit("nueva_pregunta", {
            texto: chance.sentence({
                words: 10
            })
        });
    }

});

// cuando hay una nueva pregunta en la lista

socket.on('nueva_pregunta_en_lista', function(pregunta) {

    console.log("nueva_pregunta_en_lista: --> " + JSON.stringify(pregunta));

});

// cuando hay una nueva respuesta en la lista

socket.on('nueva_respuesta_a_pregunta', function(pregunta_con_respuesta) {

    console.log("nueva respuesta a pregunta: --> "
            + JSON.stringify(pregunta_con_respuesta));

});
