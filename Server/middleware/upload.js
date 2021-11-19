const multer = require('multer');
const path = require('path');
// Set storage Engine
const storage = multer.diskStorage({
  destination: './Uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload Variable
const upload = multer({
  storage : storage,
  limits:{fileSize : 10000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('image');

// Check File type
function checkFileType(file, cb){
  // Allowed exts.
  const fileTypes = /jpeg|jpg|png|gif/;
  // check ext
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);

  if(mimeType && extname){
    return cb(null, true);
  }
  else {
    return cb('Error: Images only');
  }
}

module.exports = {upload};
