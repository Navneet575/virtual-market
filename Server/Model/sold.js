const mongoose = require('mongoose');

var SoldSchema = new mongoose.Schema({
  name:{
    type:String,
    default:'ABC'
  },
  phone:{
    type:String
  },
  addr:{
    street:{
      type:String
    },
    city:{
      type:String
    },
    state:{
      type:String
    },
    country:{
      type:String
    },
    pin:{
      type:String
    }
  },
    vId:{
      type:String,
      required:true
    },
    item:{
      name:{
        type:String
      },
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
      },
      date:{
        type:String,
        required:true
      }
    }
});

var Sold = mongoose.model('Sold', SoldSchema);

module.exports = {Sold};
