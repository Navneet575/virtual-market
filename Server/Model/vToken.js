const mongoose = require('mongoose');

const vTokenSchema = new mongoose.Schema({
  token:{
    type:String,
    required:true
  },
  createdAt:{
    type:Date,
    required:true,
    default:Date.now
  }
});

vTokenSchema.index({"createdAt":1}, {expireAfterSeconds: 45200});

var vToken = mongoose.model('vToken', vTokenSchema);
module.exports = {vToken};
