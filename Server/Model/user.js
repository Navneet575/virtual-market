const mongoose = require('mongoose');
const validator = require('validator');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');

var {vToken} = require('./vToken');
var {Item} = require('./item');
var {Cart} = require('./cart');
var {Cout} = require('./cout');
var {Orders} = require('./orders');
var {Sold} = require('./sold');

var UserSchema = new mongoose.Schema({
  name:{
    type:String
  },
  phone:{
    unique:true,
    type:String
  },
  email:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    minlength:4,
    validator:{
      validator: validator.isEmail,
      message:'{VALUE} is not a valid Email'
    }
  },
  password:{
    type:String,
    required:true,
    minlength:8
  },
  desig:{
    type:String,
    required:true
  },
  vId:{
    type:String
  },
  tokens:[{
    access:{
      type:String,
      required:true
    },
    token:{
      type:String,
      required:true
    }
  }],
  addr:{
    shopName:{
      type:String
    },
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
  adset:{
    type:Boolean,
    default:false
  },
  isVerified:{
    type:Boolean,
    default:false
  }
});

// Method overriding to return only relevant data for less exposure
UserSchema.methods.toJSON = function(){
  var user = this;
  var userObject  = user.toObject();
  return _.pick(userObject, ['id', 'email', 'desig', 'name', 'vId', 'phone', 'addr','adset', 'isVerified']);
}

// To genereate Authentication Token
UserSchema.methods.generateAuthToken = function(){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id:user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  user.tokens.push({access, token});

  return user.save().then(()=>{
    return token;
  });
}
// Confirm email
UserSchema.methods.confirmEmail = function(host) {
  var user = this;
    var access = 'verify';
    var token = jwt.sign({_id:user._id.toHexString(), access}, process.env.JWT_SECRET).toString();
    var verify = new vToken({token});

    return verify.save().then(()=>{
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: user.email, // Change to your recipient
      from: 'piogame420@gmail.com', // Change to your verified sender
      subject: 'Account Verification',
      html: `<strong><h2>Copy Below Given Text and Paste it on User Page.</h2><h3>${verify.token}</h3></strong>`,
    }

    return sgMail.send(msg).then(() => {
      return "Email Sent to "+user.email;
      }).catch((error) => {
        return error;
      });
    });
}

// To preprocess the saved password
UserSchema.pre('save', function(next){
  var user = this;

  if(user.isModified('password'))
  {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash)=>{
        user.password= hash;
        next();
      });
    });
  }
  else {
    next();
  }
});

// To find a user by the Authentication token
UserSchema.statics.findByToken = function(token){
  var User = this;
  var decoded;
  try{
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }catch(e){
    return Promise.reject();
  }
  return User.findOne({
    '_id':decoded._id,
    'tokens.token':token,
    'tokens.access':'auth'
  });
};

// To Login using Credentials
UserSchema.statics.findByCredentials = function(email, password){
  var User = this;
  return User.findOne({email}).then((user)=>{
    if(!user)
      return Promise.reject();

      return new Promise((resolve, reject)=>{
        bcrypt.compare(password, user.password, (err, res)=>{
          if(res)
            resolve(user);
          else reject();
        });
      });
  });
};

// To remove the token when LoggedOut
UserSchema.methods.removeToken = function(token){
  var user = this;
  return user.updateOne({
    $pull:{
      tokens:{token}
    }
  });
};

// Seller methods
// 1. Genereate vId
UserSchema.methods.generateVId = function(){
var user = this;

if(user.desig !== 'Seller')
  {
    return user;
  }

  var id="";

  var x = user.name.split(' ');

  for(let i=0; i<x.length; i++)
    id += x[i][0];

  var y = user.phone;

  for(let i=0; i<y.length; i+=2)
      id += y[i];

user.vId = id.toUpperCase();
    return user.save().then(()=>{
      return user;
    });
};

//2. Add New item
UserSchema.methods.addItem = function(item){
  var user = this;

  let code="";
  let temp = item.cat.split('-');

  for(let i=0; i<temp.length; i++)
    code += temp[i][0];

  code += '-';
  code += Math.floor(Math.random()*10000);

  item.itemCode=code;
  item.uId = user._id;
  item.shopName = user.addr.shopName;
  var item = new Item(item);
  return item.save().then((itm)=>{
    return itm;
  })
};
// 3.Get Items
UserSchema.methods.getItems = function(){
  var user = this;
  return Item.getItems(user._id).then((items)=>{
    return items;
  });
}
// 4.Delete item
UserSchema.methods.deleteItem = function(code){
var user = this;

  return Item.deleteItem(user._id, code);
};

// 5. Update quantity
UserSchema.methods.updateQty = function(code, qty, price){
var user = this;
return Item.updateQty(user._id, code, qty, price).then((item)=>{
  return item;
})
};

// 6. Get Orders
UserSchema.methods.getOrders = function() {
  var user = this;
  return Orders.fetchOrders(user.vId).then((orders) => {
    return orders;
  });
};

// 7. Confirm delivery
UserSchema.methods.delivered = function(uId){
  var user = this;
  return Orders.deliver(uId, user.vId).then((response)=>response);
}

// 8. Seller Summary All time
UserSchema.methods.getBills = function() {
  var user = this;
  return Sold.find({vId:user.vId}).then((itms)=>itms);
};
// Customer methods
// 1. Find Shop by vId
UserSchema.statics.getShop = function(vId){
var  User = this;
  return User.findOne({vId:vId}).then((user)=>{
    return user.getItems().then((items)=>{
      return({seller:user,items});
    });
  });
}
// 2. Add Item to cart
UserSchema.methods.addToCart = function(item){
  var user = this;
  return Cart.addItem(user._id, item.vId, item).then((item)=>{
    return item;
  });
}
// 3. get Cart Items
UserSchema.methods.getCart = function(){
  var user = this;

  return Cart.getCart(user.id);
}

// 4. Delete Cart Item
UserSchema.methods.deleteCartItem = function(item){
  var user = this;

  return Cart.deleteCartItem(user._id, item.itemCode, item.vId).then((item) => {
    return item;
  });
}
// 5. CheckingOut
UserSchema.methods.checkout = function(vId){
  var user = this;

  Orders.findOne({uId : user._id}).then((cust) => {
    if(!cust)
    {
      let temp = {};
      temp.uId = user._id;
      temp.addr = user.addr;
      temp.phone = user.phone;
      temp.vId = vId;
      temp.name = user.name;
      let x = new Orders(temp);
      x.save();
    }
  });

  return User.findOne({vId}).then((usr)=>{
    return Cart.CheckOut(user, vId, usr._id).then((response) =>{
      return response;
    });
  });
}
// 6. Get checkouts
UserSchema.methods.getCheckOuts = function(){
  var user = this;
  return Cout.find({uId: user.id}).then((dat)=>dat);
}

// Misc.
// Get Shops by location
UserSchema.statics.getShops = function (loc) {
  var User = this;
  return User.find({'addr.city':loc, desig:'Seller'}).then((shops) => shops.map((shop) => {
    let info = {
      'vId' : shop.vId,
      'shopName' : shop.addr.shopName
    }
    return info;
  }));
}
var User = mongoose.model('User', UserSchema);

module.exports = {User};
