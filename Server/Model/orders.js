const mongoose = require('mongoose');
var {Sold} = require('./sold');
var {Cout} = require('./cout');
var OrdersSchema = new mongoose.Schema({
  uId:{
    type:String,
    required:true
  },
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
    items:[{
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
    }],
    total:{
      type : Number,
      default : 0
    }
});

// 1. Get orders
OrdersSchema.statics.fetchOrders = function(vId){
  var Orders = this;
  return Orders.find({vId:vId}).then((orders) => {
    return orders;
  });
}
// 2. delivered
OrdersSchema.statics.deliver = function(uId, vId){
  var Orders = this;
  return Orders.findOne({uId:uId, vId: vId}).then((data)=>{
    if(!data)
      return Promise.reject();
    var it = {};
    it.name = data.name;
    it.phone = data.phone;
    it.addr = data.addr;
    it.vId = vId;
    data.items.forEach((item, i) => {
      it.item = item;
      let temp = new Sold(it);
      temp.save();
      Orders.deleteOne({_id: data._id}, ()=>{});
      Cout.findOne({vId:vId, 'item.itemCode':item.itemCode, uId:uId, confirmed:false}).then((dat)=>{
        if(dat){
        dat.confirmed = true;
        dat.save();}
      })
    });
    return 'Delivered';
  })
}
var Orders = mongoose.model('Orders', OrdersSchema);

module.exports = {Orders};
