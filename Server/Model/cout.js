const mongoose = require('mongoose');

var CoutSchema = new mongoose.Schema({
    uId:{
      type:String,
      required:true
    },
    vId:{
      type:String,
      required:true
    },
    item:{
      itemCode:{
        type:String,
        required:true
      },
      qty:{
        type:Number,
        default:1
      },
      price:{
        type:Number,
        required:true
      }
    },
    date:{
      type:String,
      required:true
    },
    total:{
      type:Number,
      default:0
    },
    confirmed:{
      type:Boolean,
      default:false
    }
});

var Cout = mongoose.model('Cout', CoutSchema);

module.exports = {Cout};
