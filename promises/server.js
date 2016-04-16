 


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

    console.log("pendientes: %d | contestadas: %d",  
      pendientes.size, 
      contestadas.size
      ); 

  }


  function crearPregunta(id, texto) { 
      
    var pendiente = {       

      id: ++idPreg,
      texto: texto,
      date: (new Date()), 
      alumno: id 

    };
    
     // agregar a preguntas pendientes

      pendientes.set(pendiente.id, pendiente);

      return pendiente; 



    }



  // cuando se conecta un alumno

  alumnos.on('connect', function(alumno) {

    console.log("nuevo alumno ---> %s", id(alumno));    

  	// cuando un alumno envia una pregunta ....

  	alumno.on('nueva_pregunta', function(pregunta, callback) {

  		// crear pregunta

  		var pendiente = crearPregunta(id(alumno), pregunta); 

  		// confirmar alumno

  		callback(null, pendiente.id); 

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

   docente.on('intento', function(intento, callback) {

     console.log("intento de respuesta: " + JSON.stringify(intento));   

       if (contestadas.has(intento.idPregunta)) { 
           
           callback(new Error("La pregunta ya fue contestada por otro docente."));
   
       }

       else { 

         var pendiente = pendientes.get(intento.idPregunta);   

         pendientes.delete(intento.idPregunta);

         pendiente.respuesta = {

           docente : id(docente),
           date : (new Date()),          
           texto : intento.texto       

         };

         contestadas.set(pendiente.id, pendiente); 

         callback(null, pendiente.id); // confirma con el id de la pregunta

         alumnos.emit("nueva_respuesta_a_pregunta", pendiente);   
         docentes.emit("nueva_respuesta_a_pregunta", pendiente);  

         logEstadisticas(); 

       }


     });

   docente.on('contestando_pregunta', function(idPregunta, callback) {

     callback(null, idPregunta); // siempre confirma

     docente.broadcast.emit('docente_contestando_pregunta', idPregunta); 

   });
   

 });


  io.listen(8080);









