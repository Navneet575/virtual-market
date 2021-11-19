require('./config/config'); //config.json to set Environment Variables

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
var {mongoose} = require('./db/mongoose');
var {User} = require('./Model/user');
var {authenticate} = require('./middleware/authenticate');
var {upload} = require('./middleware/upload');
var {vToken} = require('./Model/vToken');
const app = express();
const path = require('path');
const port = process.env.PORT;
const Path = path.join(__dirname, '../Main/')

app.use(express.static(Path));
app.use(bodyParser.json());
var urlencodedParser = bodyParser.urlencoded({extended:false});

app.get('/', (req, res)=>{
  res.status(200).sendFile('/main.html',{root:__dirname+'/../Main'});
});

// SigningUp or registering User
app.post('/signup', urlencodedParser, (req, res)=>{
  var body = req.body;
  var user = new User(body);
  user.save().then((usr)=>{
    if(usr.desig === 'Seller'){
    return user.generateVId().then(()=>{
      res.status(200).send(user);
    });}
    else {
      res.status(200).send(usr);
    }
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

// Confirm email
app.get('/confirmationToken', authenticate, (req, res) => {
  var user = req.user;
  if(user.isVerified)
    res.send('User Already Verified');
    else {
      user.confirmEmail(req.header.host).then((ans)=>{
        res.send(ans);
      });
    }
});

app.post('/confirm', authenticate,urlencodedParser, (req, res) => {
  var token = req.body.token;
  vToken.findOne({token}).then((val) => {
    if(val)
    {
      req.user.isVerified=true;
      vToken.deleteOne({token}, ()=>{});
      req.user.save().then(()=>{
        res.send("Email Verification Successful.");
      });
    }
    else {
      res.status(400).send("Token Expired.");
    }
  });
});
// LoggingIn
app.post('/login', urlencodedParser, (req, res)=>{
  var body = req.body;
  User.findByCredentials(body.email, body.password).then((user)=>{
    user.generateAuthToken().then((token)=>{
      res.header('x-auth', token).status(200).send(user);
    });
  }).catch((e)=>{
    res.status(401).send('Error'+e);
  })
});

// get user
app.get('/login/user', authenticate, (req, res)=>{
res.status(200).send(req.user);
});

// logging Out
app.delete('/login', authenticate, (req, res)=>{
  req.user.removeToken(req.token).then(()=>{
    res.status(200).send('Logged Out');
  },(e)=>{
    res.status(401).send(e);
  });
});

// Get Image
app.get('/Uploads/:t', urlencodedParser, (req, res) => {
  let t = req.params['t'];
  res.sendFile(t, {root:'./Uploads'});
});

// User Routes
// 1. Add/Update Address
app.post('/login/addr', authenticate, urlencodedParser, (req, res)=>{
var body = req.body;

var user = req.user;
user.adset=true;
user.addr = body;
  user.save().then((user)=>{
      res.status(200).send(user);
    }).catch((e)=>{
      res.status(400).send(e);
  });
});


// Seller Routes
// 1. Add Item for the shop
app.post('/login/seller/item', authenticate, (req, res)=>{
  upload(req, res, (err) => {
    if(err){
        res.status(400).send('Error Uploading');
    }
    else if(req.file == undefined)
    {
        res.status(400).send('Error: No file received.');
    }
    else {
      var item = req.body;
      item.image = req.file.path;
      req.user.addItem(item).then((itm)=>{
        res.status(200).send(itm);
      }).catch((err)=>{
        res.status(400).send('Error Uploading File');
      });
    }
  });
});

// 2. get Items
app.get('/login/seller/items', authenticate, urlencodedParser, (req, res)=>{
  req.user.getItems().then((items)=>{
    if(items.length === 0)
      res.status(200).send('Empty Store');
    res.status(200).send(items);
  }).catch(()=>{
    res.status(400).send("No Item found");
  })
});

// 3. Delete Item from the shop
app.delete('/login/seller/item', authenticate, urlencodedParser, (req, res)=>{
  var item = req.body;

  req.user.deleteItem(item.itemCode).then(()=>{
      res.status(200).send('Item Deleted from Store.');
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

//4. Update item
app.post('/login/seller/updateItem', authenticate, urlencodedParser, (req, res)=>{
  var item = req.body;

  req.user.updateQty(item.itemCode, item.qty, item.price).then((newItem)=>{
    res.status(200).send(newItem);
  }).catch((e)=>{
    res.status(401).send('Unauthorized');
  });
});

// 5. Received Orders
app.get('/seller/orders', authenticate, urlencodedParser, (req, res) => {
  var seller = req.user;

  seller.getOrders().then((orders) => {
    res.status(200).send(orders);
  }).catch  ((err)=>{
    res.status(400).send('Error Fetching Orders.');
  });
});

// 6. Confirm Delivery
app.post('/order/confirm', authenticate, urlencodedParser, (req, res) => {
  var seller = req.user;
  var uId = req.body.uId;
  seller.delivered(uId).then((response) =>{
    res.status(200).send("Order Confirmed.");
  }).catch((err)=>res.status(400).send("Error Completing Request."));
});
// 7. Sold Items
app.get('/sold', authenticate, urlencodedParser, (req, res) => {
  var seller = req.user;

  seller.getBills().then((solds) => res.status(200).send(solds)).catch((err)=>res.status(400).send("Error Fetching Data"));
});
// Customer Routes
// 1.FindShop By VID
app.get('/shop/:vid', urlencodedParser, (req, res)=>{
  var id = req.params['vid'];
  User.getShop(id).then((Shop)=>{
      res.status(200).send(Shop);
  }).catch((e)=>{
    res.status(400).send('Error Getting Shop!');
  });
});

// 2. Add item to Cart
app.post('/cart/add', urlencodedParser, authenticate, (req, res) => {
  var item = req.body;
  req.user.addToCart(item).then((item) =>{
    if(item == -1)
    res.status(200).send('Item Already exist in your Cart.');
    else
    res.status(200).send('Added to cart.');
  }).catch((e)=>{
    res.status(400).send(e);
  });
});

// 3. get Cart
app.get('/cart', urlencodedParser, authenticate, (req, res) => {
  req.user.getCart().then((items)=>{
    res.status(200).send(items);
  }).catch((e) => {
    res.status(400).send('Cannot Fetch Your Cart.');
  });
});

// 4. Delete Cart Item
app.delete('/cart/item', urlencodedParser, authenticate, (req, res) => {
  var item = req.body;
  req.user.deleteCartItem(item).then(() => {
    res.status(200).send('Item Deleted Successfully.');
  }).catch((e) => {
    res.status(400).send('Unable to Delete Item.');
  });
});

// 5. CheckOut
app.post('/cart/checkout', urlencodedParser, authenticate, (req, res) => {
  try{
  var vId = req.body.vId;
  req.user.checkout(vId).then((response) => {
    if(response === -1)
    res.status(400).send("Error Checking Out");
    else {
      res.status(200).send('Checked Out');
    }
  });
}
  catch(err){
    res.status(400).send("Error Checking Out");
  }
});

// 6. Get Checkouts
app.get('/checkouts', authenticate, (req, res)=>{
  req.user.getCheckOuts().then((couts)=>{
    res.status(200).send(couts);
  });
});

// Miscellenous
// Get Shops by location
app.get('/shops/:loc', urlencodedParser, (req, res) => {
  var location = req.params['loc'];
  User.getShops(location).then((shops) => {
      res.status(200).send(shops);
  });
});
// Port listening
app.listen(port, ()=>{console.log('Server is listening on ', port)});
