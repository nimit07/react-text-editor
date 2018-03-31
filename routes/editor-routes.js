const fs = require('fs');

module.exports.readFile= function(app, db) {
    app.post('/openOrCreateFile/', (req, res) => {
        let content ="";
        const body = req.body;
        console.log(req.body);
        let fileName = body.fileName;
        fileName=fileName.replace('.','');
        const fileRef = db.ref('fileData/'+fileName);

        fileRef.once("value")
            .then(function(snapshot) {

              if(snapshot.exists()){
                  console.log('does exists: '+snapshot.val());
                  res.send(snapshot.val());

              }else{
                  console.log('does  not exist');
                  res.send({});
              }
            });
    });
};
module.exports.saveFile= function(app, db) {

    app.post('/saveFile/', (req, res) => {
        //const fileRef = db().ref('fileData');
        console.log(req.body);
        const body = req.body;
        let fileName = body.fileName;
        const data ={
            fileName:fileName,
            data:body.text
        };
        fileName=fileName.replace('.','');
        const fileRef = db.ref('fileData/'+fileName);

        fileRef.set(data);

        res.send(req.param('fileName'));
    });
};