const fs = require('fs');

module.exports.readFile= function(app, db) {
    app.post('/openOrCreateFile/', (req, res) => {
        let content ="";
        const body = req.body;
        console.log(req.body);
        const fileName = body.fileName;
        fs.readFile(fileName,(err,data)=> {

            if (err) {
                fs.writeFile(fileName, "", function(err) {
                    if (err) {
                        console.log(err);
                    }

                });
            }
            else{
                // fs.readFile(fileName, function read(err, data) {
                //     if (err) {
                //         throw err;
                //     }
                //     content = data;
                //
                //
                // });
                content=data;
                console.log("data: "+content);
                res.send(content);
            }

        });


    });
};
module.exports.saveFile= function(app, db) {
    app.post('/saveFile/', (req, res) => {
        console.log(req.body);
        const body = req.body;
        const fileName = body.fileName;
        fs.writeFile(fileName, JSON.stringify(body.text), function(err) {
            if (err) {
                console.log(err);
            }

        });
        res.send(req.param('fileName'));
    });
};