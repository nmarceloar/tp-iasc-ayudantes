/*******************************************************************************
 * ****************************************************
 * 
 * 
 */


'use strict' ; 


var io = require('socket.io')();

var alumnos = io.of('/alumnos');
var docentes = io.of('/docentes');

var pendientes = new Map();
var contestadas = new Map();

var idPreg = 0;

var intentos = 0; 

function id(socket) {
     
    
    var addr = socket.request.client._peername.address; 
    var port = socket.request.client._peername.port;   
    
    return "[" + addr + "]" + ":"  + port; 
    

}



function logEstadisticas() { 
    
    console.log("pendientes: %d | contestadas: %d | intentos: %d", 
        pendientes.size, 
        contestadas.size, 
        intentos); 
    
}



// cuando se conecta un alumno

alumnos.on('connect', function(alumno) {
           
    console.log("nuevo alumno ---> %s", id(alumno) );    

	// cuando un alumno envia una pregunta ....

	alumno.on('nueva_pregunta', function(pregunta) {

		// crear pregunta

		var pendiente = { 			
		
				id : ++idPreg,
				texto : pregunta.texto,
				date : Date.now(),
				alumno : id(alumno)	
		}; 
			

		// agregar a preguntas pendientes

		pendientes.set(pendiente.id, pendiente);

		// notificar alumnos

		alumnos.emit('nueva_pregunta_en_lista', pendiente);

		// notificar docentes

		docentes.emit('nueva_pregunta_en_lista', pendiente);	
		

	});

});



// cuando se conecta un docente

docentes.on('connect', function(docente) {
    
    console.log("nuevo docente ---> %s", id(docente) ); 

 // enviar preguntas pendientes
        
    docente.emit('preguntas_pendientes', Array.from(pendientes.values()));   
 
 // cuando un docente intenta contestar una pregunta

    docente.on('intento', function(intento) {
     
     console.log("intento de respuesta: " + JSON.stringify(intento));   
    
     // intentar responder

     if (contestadas.has(intento.idPregunta)) {
         
         docente.emit('respuesta_no_aceptada', {
             id: intento.idPregunta, 
             msg: 'Ya fue contestada por otro docente' } );
         
         return;
         
     }

     var pendiente = pendientes.get(intento.idPregunta);   
     
     pendientes.delete(intento.idPregunta);
     
     pendiente.respuesta = {
             
             docente : id(docente),
             date : Date.now(),          
             texto : intento.texto       
             
         };

     contestadas.set(pendiente.id, pendiente);            
                     
     alumnos.emit("nueva_respuesta_a_pregunta", pendiente);
     
     docentes.emit("nueva_respuesta_a_pregunta", pendiente);
     
     
     

 });

 docente.on('contestando_pregunta', function(idPregunta) {
    
     docente.broadcast.emit('docente_contestando_pregunta', 
         {id_pregunta: idPregunta,
         id_docente: id(docente) }
     );

 });
 

});


io.listen(8080);









