console.log("Seller Live");

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
            jQuery('#vId').text(user.vId);
            sessionStorage.setItem('vId', user.vId);
            startOrganising();
            if (user.adset === true) {
                jQuery('#update').text('Update Address');

                if (user.addr.shopName)
                    document.getElementById('shop').value = user.addr.shopName;
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
            else 
            {
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
                                console.log('clicked');
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
        sessionStorage.clear();
        window.location.href = '../';
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
                    jQuery('#addressButton').text('Change Address');
                    jQuery('#address').attr('style', 'display:block');
                    let user = JSON.parse(this.responseText);
                    document.getElementById('shop').innerText = user.addr.shopName;
                    document.getElementById('Addr').innerText = user.addr.street;
                    document.getElementById('ACity').innerText = user.addr.city;
                    document.getElementById('AState').innerText = user.addr.state;
                    document.getElementById('ACount').innerText = user.addr.country;
                    document.getElementById('APin').innerText = user.addr.pin;
                    alert('Address Updated');
                }
            }
        }
        let shopName = document.getElementById('shop').value;
        let city = document.getElementById('city').value;
        let country = document.getElementById('country').value;
        let state = document.getElementById('state').value;
        let street = document.getElementById('street').value;
        let pin = document.getElementById('pin').value;
        req.send(`shopName=${shopName}&city=${city}&street=${street}&state=${state}&country=${country}&pin=${pin}`);
    });
}



// ----------------------Orders------------------------

var arr = new Array();
var uIds = new Array();

class items {
    constructor(item) {
        this.name = item.name;
        this.itemCode = item.itemCode;
        this.price = item.price;
        this.qty = item.qty;
        this.date = item.date;
    }

    appendRow(i) {
        let template = jQuery('#Item-Template').html();
        let html = Mustache.render(template, {
            name: this.name,
            itemCode: this.itemCode,
            price: this.price,
            qty: this.qty,
            date: this.date
        });

        jQuery('.O-items').eq(i).append(html);
    }
}

OrderDetails = function (data, i) {
    let template = jQuery('#Orders-template').html();
    var html = Mustache.render(template, {
        street: data.addr.street,
        city: data.addr.city,
        state: data.addr.state,
        pin: data.addr.pin,
        phone: data.phone,
        total: data.total
    });
    jQuery('#ORDRS').append(html);

    data.items.forEach(item => {
        let temp = new items(item);
        arr.push(temp);
        temp.appendRow(i);
    });
}

confirmOrders = function () {
    let docs = document.getElementsByClassName('confirm');

    for (let i = 0; i < docs.length; i++) {
        docs[i].onclick = function () {
            req.open('post', '/order/confirm');
            req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
            req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        alert(this.responseText);
                        jQuery('.order').eq(i).attr('style', 'display:none');
                    }
                    else {
                        alert(this.responseText);
                    }
                }
            }
            req.send(`uId=${uIds[i]}`);
        }
    }
}

const ordrs = function () {
    var req = new XMLHttpRequest();

    req.open('get', '/seller/orders');
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status == 200) {

                jQuery('#ORDRS').html('');
                let data = JSON.parse(this.responseText);
                if (data.length)
                    jQuery('#noOrders').attr('style', 'display:none');
                let i = 0;
                data.forEach(element => {
                    OrderDetails(element, i);
                    uIds.push(element.uId);
                    i++;
                });
                confirmOrders();
            }
            else if (this.status == 400)
                alert(this.responseText);
        }
    }
    req.send();
}

jQuery('nav li').eq(1).on('click', ordrs);
jQuery('nav li').eq(5).on('click', ordrs);
jQuery('nav li').eq(8).on('click', ordrs);

// Shop Organising 
var orgArr = new Array();
class OrganiseItems {
    constructor(item) {
        this.name=item.name;
        this.itemCode = item.itemCode;
        this.cat = item.cat;
        this.price = item.price;
        this.qty = item.qty;
        this.src = item.image;
    }

    appendItem() {
        var template = jQuery('#Shop-Items-template').html();
        var html = Mustache.render(template, {
            name:this.name,
            code: this.itemCode,
            cat: this.cat,
            price: this.price,
            qty: this.qty,
            src: this.src,
            shopName: this.shopName
        });

        jQuery("#Shop__Items").append(html);
    }

    updaTeItem(p, q, i) {
        req.open('post', '/login/seller/updateItem', true);
        req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function () {
            if (this.readyState === 4)
                if (this.status === 200) {
                    this.price = p;
                    this.qty = q;
                    jQuery('.p input').eq(i).css('background', '#d2f5e3');
                    jQuery('.q input').eq(i).css('background', '#d2f5e3');
                    setTimeout(() => {
                        jQuery('.p input').eq(i).css('background', '#ffffff4f');
                        jQuery('.q input').eq(i).css('background', '#ffffff4f');;
                    }, 1000)
                }
                else
                    alert(this.responseText);
        }
        req.send(`itemCode=${this.itemCode}&price=${p}&vId=${vId}&qty=${q}`);
    }
    deleteItem(i) {
        req.open('delete', '/login/seller/item', true);
        req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function () {
            if (this.readyState === 4)
                if (this.status === 200) {
                    document.getElementsByClassName('items')[i].style.display = 'none';
                    alert(this.responseText);
                }
                else
                    alert(this.responseText);
        }
        req.send(`itemCode=${this.itemCode}`);
    }
}; //End of class
function startOrganising() {
    let vId = sessionStorage.vId;
    req.open('get', `/shop/${vId}`);
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                let obj = JSON.parse(this.responseText);
                // console.log(obj);
                obj.items.forEach((item) => {
                    let temp = new OrganiseItems(item);
                    orgArr.push(temp);
                    orgArr[orgArr.length - 1].appendItem();
                });
                Update();
                Delete();
            }
        }
    }
    req.send();

}
Update = function () {
    var upItem = document.getElementsByClassName('Shop__Update');
    for (let i = 0; i < upItem.length; i++) {
        upItem[i].onclick = function () {
            let q = jQuery('.q input').eq(i).val();
            let p = jQuery('.p input').eq(i).val();
            orgArr[i].updaTeItem(p, q, i);
        }
    }
}
Delete = function () {
    var delCart = document.getElementsByClassName('Shop__Delete');
    for (let i = 0; i < delCart.length; i++) {
        delCart[i].onclick = function () {
            orgArr[i].deleteItem(i);
        }
    }
}

function addNewItem(data) {
    console.log(data)
    req.open('post', '/login/seller/item', true);
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.onreadystatechange = function () {
        if (this.readyState === 4)
            if (this.status === 200) {
                let item = JSON.parse(this.responseText);
                let temp = new OrganiseItems(item);
                orgArr.push(temp);
                orgArr[orgArr.length - 1].appendItem();
                Update();
                Delete();
            }
            else
                alert(this.responseText);
    }
    req.send(data);
}

document.getElementById('Add').onclick = function () {
    let cat = document.getElementById('cat').value;
    let price = document.getElementById('price').value;
    let qty = document.getElementById('qty').value;
    let img = document.getElementById('itm-image').files[0];
    let name = document.getElementById('name').value;
    let data = new FormData();
    data.append('name',name);
    data.append('cat', cat);
    data.append('price', price);
    data.append('qty', qty);
    data.append('image', img);
    addNewItem(data);
};