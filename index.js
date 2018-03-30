  const express = require('express');
  const http = require('http');
  const socketIO = require('socket.io');
  const fs = require('fs');
  const bodyParser     = require('body-parser');

  const port = 4001;

  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(function (req, res, next) {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // // Request methods you wish to allow
       res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      //
      // // Request headers you wish to allow
       res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
      //
      // // Set to true if you need the website to include cookies in the requests sent
      // // to the API (e.g. in case you use sessions)
      // res.setHeader('Access-Control-Allow-Credentials', true);
      //
      // // Pass to next layer of middleware
      next();
  })
  require('./routes')(app, {});
  // our server instance
  const server = http.createServer(app);

  // This creates our socket using the instance of the server
  const io = socketIO(server);
  io.on('connection', socket => {
    console.log('New client connected');


    socket.on('fileEdit', (text) => {

      console.log('Text Changed to: ', text);
      io.sockets.emit('change text', text)
    });

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  server.listen(port, () => console.log(`Listening on port ${port}`))
