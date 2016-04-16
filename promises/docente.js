/*
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

 

 var socket = require('socket.io-client')('http://localhost:8080/docentes');
 
 socket.emitAsync = require('bluebird').promisify(socket.emit); 

 var Chance = require('chance');
  
 var chance = new Chance(); 

 var RandomTimer = require("./../timer.js");

 var timer = new RandomTimer(3000,5000);
 
 
 var pendientes = new Map(); 
 var escribiendo_otros = new Map(); 
 
 function hayPendientes() { 

    return (pendientes.size > 0); 
    
}

function addPendiente(pregunta) {
       
    pendientes.set(pregunta.id, pregunta);   

}



function next() {

    return pendientes.get(pendientes.keys().next().value);     
    
}

function deletePendienteById(idPregunta) {

    return pendientes.delete(idPregunta);    

}

function deleteOtrosById(idPregunta) { 

    return escribiendo_otros.delete(idPregunta);    

}

function randomDelay(min, max) {

    return Math.floor(Math.random() * (max - min + 1) + min);

}

function crearRespuesta() {
    
    // simula el proceso de escritura de una respuesta

    return new Promise(function(resolve, reject) {

        setTimeout(function(){

            resolve(chance.sentence({words: 5})); 

        }, randomDelay(3000,5000)); 

    }); 

}


function enviarRespuesta(intento) { 
    
    return socket.emitAsync('intento', intento);
            
}

function notificarInicio(id) { // notifica que empezó a contestar una pregunta
    
    return socket.emitAsync('contestando_pregunta', id);   
    
    
}





// cuando docente se conecta a la lista

socket.on('connect', function() {

    console.log("connectado a servidor");
    
    // intenta contestar las preguntas

    timer.on('tick', function() {        

        if (hayPendientes()) {

            var pendiente = next();

            if(!escribiendo_otros.has(pendiente.id)) {           

                notificarInicio(pendiente.id)                
                    .then(crearRespuesta)           
                    .then(function(respuesta){

                        if(!escribiendo_otros.has(pendiente.id)) {  
                            
                            enviarRespuesta({idPregunta: pendiente.id,texto: respuesta})
                                .then(console.log)
                                .catch(console.log);
                            
                            }})
                        
                    .catch(console.log);
                
            }

        }

    });

});



socket.on('preguntas_pendientes', function(_pendientes) {    

    for(var idx = 0; idx < _pendientes.length; idx++) {

        addPendiente(_pendientes[idx]);

    }   

});

// cuando hay una nueva pregunta en la lista

socket.on('nueva_pregunta_en_lista', function(pregunta) {

    // la agrega como pendiente

    addPendiente(pregunta);
    
    console.log("nueva_pregunta_en_lista: --> " + JSON.stringify(pregunta));

});

// cuando hay una nueva respuesta en la lista

socket.on('nueva_respuesta_a_pregunta', function(pregunta_con_respuesta) {

    deletePendienteById(pregunta_con_respuesta.id); 
    deleteOtrosById(pregunta_con_respuesta.id);
    
    console.log("nueva_respuesta_a_pregunta --> "
        + JSON.stringify(pregunta_con_respuesta));

});


socket.on('docente_contestando_pregunta', function(event_data) {

    escribiendo_otros.set(event_data.id_pregunta, true); 

    console.log('docente contestando pregunta: %d', event_data); 

}); 