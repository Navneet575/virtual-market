console.log("Customer Live");

var globalTotal = 0;
var CartShops = new Array();
// Get User Data
var req = new XMLHttpRequest();
req.open('get', '/login/user');
req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
req.onreadystatechange = function () {
    if (this.readyState === 4) {
        if (this.status === 200) {
            let user = JSON.parse(this.responseText);
            jQuery('#User h2 a').eq(0).text(user.name);
            document.getElementById('CMail').href = 'mailto:' + user.email;
            document.getElementById('CMail').innerText = user.email;
            document.getElementById('CTel').innerText = user.phone;

            if (user.adset === true) {
                jQuery('#update').text('Update Address');
                jQuery('#address').attr('style', 'display:block');
                document.getElementById('Addr').innerText = user.addr.street;
                document.getElementById('ACity').innerText = user.addr.city;
                document.getElementById('AState').innerText = user.addr.state;
                document.getElementById('ACount').innerText = user.addr.country;
                document.getElementById('APin').innerText = user.addr.pin;
                document.getElementById('city').value = user.addr.city;
                document.getElementById('country').value = user.addr.country;
                document.getElementById('state').value = user.addr.state;
                document.getElementById('street').value = user.addr.street;
                document.getElementById('pin').value = user.addr.pin;
            }
            else {
                alert('Kindly Update Address.')
            }
            if (user.isVerified) {
                jQuery('#verified').attr('style', 'display:inline');
            }
            else {
                jQuery('#notVerified').attr('style', 'display:inline');
                jQuery('#verify').on('click', function () {
                    jQuery('#verify').attr('disabled', true);
                    req.open('get', '/confirmationToken');
                    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
                    req.onreadystatechange = function () {
                        if (this.readyState === 4) {
                            jQuery('#con').attr('style', 'display:inline');
                            alert(this.responseText);
                            jQuery('#confirmToken').on('click', function () {

                                jQuery('#confirmToken').attr('disabled', true);
                                req.open('post', '/confirm');
                                req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
                                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                                req.onreadystatechange = function () {
                                    if (this.readyState === 4) {
                                        if (this.status === 200) {
                                            jQuery('#notVerified').attr('style', 'display:none');
                                            jQuery('#verified').attr('style', 'display:inline');
                                            alert(this.responseText);
                                        }
                                        else {
                                            alert(this.responseText);
                                        }
                                    }
                                }
                                let token = document.getElementById('vToken').value;
                                req.send(`token=${token}`);
                            });
                        }
                    }
                    req.send();
                });
            }
            address();
        }
        else {
            console.log('Not verified!!!');
        }
    }
}
req.send();

document.getElementById('logout').onclick = function () {
    req.open('delete', '/login');
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.onreadystatechange = function () {
        sessionStorage.clear('x-auth');
        window.location.href = '/';
    }
    req.send();
}
address = function () {
    jQuery('#update').on('click', function () {
        req.open('post', '/login/addr');
        req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    // jQuery('#addressButton').text('Change Address');
                    jQuery('#address').attr('style', 'display:block');
                    let user = JSON.parse(this.responseText);
                    document.getElementById('Addr').innerText = user.addr.street;
                    document.getElementById('ACity').innerText = user.addr.city;
                    document.getElementById('AState').innerText = user.addr.state;
                    document.getElementById('ACount').innerText = user.addr.country;
                    document.getElementById('APin').innerText = user.addr.pin;
                    alert('Address Updated');
                }
            }
        }
        let city = document.getElementById('city').value;
        let country = document.getElementById('country').value;
        let state = document.getElementById('state').value;
        let street = document.getElementById('street').value;
        let pin = document.getElementById('pin').value;
        req.send(`city=${city}&street=${street}&state=${state}&country=${country}&pin=${pin}`);
    });
}
// Managing Cart Items
class cartItems {
    constructor(item, shop) {
        this.itemCode = item.itemCode;
        this.qty = item.qty;
        this.price = item.price;
        this.vId = shop;
        this.src = item.image;
        this.shopName = item.shopName;
    }
    listCartItems() {
        var template = jQuery('#Cart__item').html();
        // console.log(this);
        var html = Mustache.render(template, {
            src: this.src,
            code: this.itemCode,
            qty: this.qty,
            price: this.price
        });
        let i = jQuery('.Shop__items').length - 1;
        jQuery('.Shop__items').eq(i).append(html);
    }
    deleteCartItem(el) {
        var item = this;
        req.open('delete', '/cart/item');
        req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    el.style.display = 'none';
                    globalTotal = globalTotal - item.price * item.qty;
                    jQuery('#Total__Price').text(globalTotal);
                }
                else
                    alert('Error!!! Try to refresh.');
            }
        }
        req.send(`vId=${this.vId}&itemCode=${this.itemCode}`);
    }
    view() {
        jQuery('#Image h2').text('');
        jQuery('#Image img').attr('src', this.src);
    }
    checkOut(vId) {
        req.open('post', '/cart/checkout');
        req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    alert('Items shall be Delivered. Please Refresh to Proceed.');
                }
                else
                    alert(this.responseText);
            }
        }
        req.send(`vId=${vId}`);
    }
}

var arr = new Array();

// Displaying Cart
const cart = function () {
    req.open('get', '/cart', true);
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                jQuery('#cards').html(null);
                let items = JSON.parse(this.responseText);
                items.forEach(i => {
                    AddShopCart(i);
                });
                DeleteItems();
            }
        }
    }
    req.send();
};
jQuery('nav li').eq(1).on('click', cart);
jQuery('nav li').eq(5).on('click', cart);
jQuery('nav li').eq(8).on('click', cart);
AddShopCart = function (cart) {
    if (cart.items.length < 1)
        return;
    var template = jQuery('#ShopCart-template').html();
    globalTotal = cart.total;
    CartShops.push(cart.vId);
    var html = Mustache.render(template, {
        SName: cart.shopName,
        total: cart.total
    });
    jQuery('#cards').append(html);

    cart.items.forEach(item => {
        let temp = new cartItems(item, cart.vId);
        arr.push(temp);
        arr[arr.length - 1].listCartItems();
    });
    cout();
}

DeleteItems = function () {
    let del = document.getElementsByClassName('delete__Cart');
    for (let i = 0; i < del.length; i++) {
        let el = document.getElementsByClassName('table__items')[i];
        el.onclick = () => { arr[i].view(); }
        del[i].onclick = function () { arr[i].deleteCartItem(el) };
    }
}

StartShopping = function () {
    jQuery('#Start').attr('style', 'display:block');

    jQuery('#go').on('click', function () {

        let vId = document.getElementById('vId').value.toUpperCase();

        if (vId) { sessionStorage.setItem('vId', vId); window.location.href = "/shop.html" }
        else {
            alert('Enter a Valid Shop Id.');
        }
    });
}

// document.getElementById('myButton').onclick = ()=>{StartShopping()};

var cout = function () {
    var coButtons = document.getElementsByClassName('Checkout__Button');
    for (let i = 0; i < coButtons.length; i++) {
        coButtons[i].onclick = function () {
            arr[i].checkOut(CartShops[i]);
        }
    }
}


// -----------------------CHECKOUT HISTORY--------------------------

function addCheckOut(c) {
    var template = jQuery('#CheckoutItem-template').html();
    var html = Mustache.render(template, {
        vId: c.vId,
        itemCode: c.item.itemCode,
        price: c.item.price,
        qty: c.item.qty,
        total: c.total,
        date: c.date
    });
    jQuery('#cout #items').append(html);
    if (c.confirmed)
        jQuery('.confirmed').text('Status: Confirmed');
}
const dispcout = () => {
    req.open('get', '/checkouts');
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                jQuery('#items').text('');
                let cout = JSON.parse(this.responseText);
                if (cout[0]) {
                    jQuery('#bought').attr('style', 'display:none');
                    cout.forEach(element => {
                        addCheckOut(element);
                    });
                }
            }
        }
    }
    req.send();
}
jQuery('nav li').eq(2).on('click', () => {
    dispcout();
});
jQuery('nav li').eq(6).on('click', () => {
    dispcout();
});
jQuery('nav li').eq(9).on('click', () => {
    dispcout();
});