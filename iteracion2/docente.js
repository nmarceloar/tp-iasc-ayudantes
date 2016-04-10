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

var chance = require('chance')();

var RandomTimer = require("./../timer.js");

var timer = new RandomTimer(3000,5000);

var pendientes = new Map();

function hayPendientes() { 
    
    return pendientes.size > 0; 
    
}

function addPendiente(pregunta) { 
    
    pendientes.set(pregunta.id, pregunta); 
    
}

function logPendientes(){ 
    
    pendientes.forEach(function(value, key) {
        
        console.log(value);    
        
    }, pendientes); 
    
}

function next() {
    
    return pendientes.get(pendientes.keys().next().value);     
    
}

function deleteById(idPregunta) {
    
    return pendientes.delete(idPregunta);    
    
}

function randomDelay(min, max) {

    return Math.floor(Math.random() * (max - min + 1) + min);

}


// cuando docente se conecta a la lista

socket.on('connect', function() {

    console.log("connectado a servidor");
    
    // intenta contestar las preguntas

    timer.on('tick', function() {        
        
            if (!hayPendientes())
                return;

            var pendiente = next();
            deleteById(pendiente.id);
            
            socket.emit('contestando_pregunta', pendiente.id);
            
             setTimeout(function() {
                            
             socket.emit('intento', { idPregunta: pendiente.id,
             texto: chance.sentence({
             words: 10})});
                            
                        	
             }, randomDelay(3000, 5000));
                        
          
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
    
    deleteById(pregunta_con_respuesta.id)    

    console.log("nueva_respuesta_a_pregunta --> "
            + JSON.stringify(pregunta_con_respuesta));

});

socket.on('respuesta_no_aceptada', function(error) {

    console.log("Respuesta a pregunta: %d no aceptada. Msg: %s",
        error.id,
        error.msg);

});

socket.on('docente_contestando_pregunta', function(contestando) {
    
    console.log('docente %s contestando pregunta: %d', contestando.id_docente, contestando.id_pregunta); 
    
}); 


