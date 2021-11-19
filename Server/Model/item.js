const mongoose = require('mongoose');
var ItemSchema = new mongoose.Schema({
    uId:{
      type:String,
      required:true
    },
    name:{
      type:String,
      default:'Product X'
    },
    itemCode:{
      type:String,
      required:true
    },
    shopName:{
        type:String,
        required:true
    },
    image:{
      type:String,
      required:true
    },
    price:{
      type:Number,
      required:true
    },
    cat:{
      type:String,
      required:true
    },
    img:{
      data:Buffer,
      contentType:String
    },
    qty:{
      type:Number,
      default:1
    }
});

// Item statics
// 1. Get items
ItemSchema.statics.getItems = function(id){
  var Item = this;
  return Item.find({uId:id}).then((items)=>{
    return items;
  });
}
// 2. Delete Items
ItemSchema.statics.deleteItem = function(id, code){
  var Item = this;

  return Item.deleteOne({uId:id, itemCode:code});
}
// 3. Update Item
ItemSchema.statics.updateQty = function(id, code, qty, price){
  var Item = this;

  return Item.findOneAndUpdate({uId:id, itemCode:code}, {$set:{qty, price}}, (item)=>{return item});
}

// 4.check Availability
ItemSchema.statics.checkAvailability = function(itemCode, uId){
  var Item = this;
  return Item.findOne({uId, itemCode}).then((itm)=>itm);
};

var Item = mongoose.model('Item', ItemSchema);

module.exports = {Item};
