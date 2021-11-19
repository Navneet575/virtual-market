const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const {Item} = require('./item');
const {Cout} = require('./cout');
const {Orders} = require('./orders');

var CartSchema = new mongoose.Schema({
    uId:{
      type:String,
      required:true
    },
    vId:{
      type:String,
      required:true
    },
    shopName:{
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
      image:{
        type:String,
        required:true
      }
    }],
    total:{
      type : Number,
      default : 0
    }
});

// Item statics

// 1. get Cart Items
CartSchema.statics.getCart = function(id){
  var Cart = this;

  return Cart.find({uId:id}).then((items)=>{
    return items;
  });
}

// 2. Delete Items
CartSchema.statics.deleteCartItem = function(id, code, vId){
  var Cart = this;
  return Cart.findOne({uId:id, vId:vId}).then((cart) => {

    for(let i=0; i<cart.items.length; i++)
    {
      if(cart.items[i].itemCode == code)
      {
        cart.total -= cart.items[i].price*cart.items[i].qty;
        cart.items.splice(i, 1);
        return cart.save().then((c)=>{ return c;});
      }
    }
  });
}

// 3. Update Item
CartSchema.statics.updateCart = function(id, code, qty, vId){
  var Cart= this;

  return Cart.findOneAndUpdate({uId:id, itemCode:code, vId:vId}, {$set:{qty}}, (item)=>{return item});
}
// 4. Add Item
CartSchema.statics.addItem = function(id, vId, item) {
  console.log(item);
  var Cart = this;
  return Cart.findOne({uId:id, vId:vId}).then((cart)=> {
    if(!cart)
    {
      let val = new Cart({uId:id, vId:vId, shopName:item.shopName});
      val.items.push({name:item.name, itemCode:item.itemCode, qty:item.qty, price:item.price, image:item.image});

      let i = val.items.length - 1 ;
      val.total = (val.items[i].price)*(val.items[i].qty);
      return val.save().then((c)=> {return c;});
    }else {
      for(let i=0; i<cart.items.length; i++)
      {
        if(cart.items[i].itemCode == item.itemCode)
        {
          return -1;
        }
      }
      cart.items.push({name:item.name, itemCode:item.itemCode, qty:item.qty, price:item.price, image:item.image});

      let i = cart.items.length - 1 ;
      cart.total += (cart.items[i].price)*(cart.items[i].qty);
      return cart.save().then((c)=> {return c;});
    }
  });
}
// 5. CheckOut
CartSchema.statics.CheckOut = function(user, vId, uId){
  var Cart = this;
  return Cart.findOne({uId:user._id, vId:vId}).then((cart)=>{
    if(cart){
      let total = cart.total;
      let date = new Date();
    let len = cart.items.length;
    for(let i=0; i<cart.items.length; i++)
    {
      let itms = cart.items[i];
      Item.checkAvailability(cart.items[i].itemCode, uId).then((itm)=>{
        if(itm.qty-cart.items[i].qty>=0)
          {
            itm.qty = itm.qty-itms.qty;
            itm.save();
            let it = {};
            it.item = itms;
            it.vId=cart.vId;
            it.uId=cart.uId;
            it.date = date;
            it.total = cart.total;
            let temp = new Cout(it);
            temp.save().then(()=>{
              Orders.findOne({uId: user._id}).then((cust) => {
                  if(cust)
                  {
                    let im = {};
                    cust.total = cust.total + total;
                    im.itemCode = itms.itemCode;
                    im.qty = itms.qty;
                    im.price = itms.price;
                    im.date = date;
                    cust.items.push(im);
                    cust.save();
                  }
              });
            });
          }
          if(i === cart.items.length-1)
          {
            cart.items.splice(0,cart.items.length);
            cart.total=0;
            return cart.save().then((res)=>res);
          }
      });
    }
  }
  else {
    return -1;
  }
});
};


var Cart = mongoose.model('Cart', CartSchema);

module.exports = {Cart};
