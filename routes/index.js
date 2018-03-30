const editorRoutes = require('./editor-routes');
module.exports = function(app, db) {
    editorRoutes.readFile(app, db);
    editorRoutes.saveFile(app, db);
    // Other route groups could go here, in the future
};
