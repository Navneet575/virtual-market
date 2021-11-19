console.log("Shop organizing is Live");

const vId = sessionStorage.getItem('vId');
var req = new XMLHttpRequest();
let form = document.getElementById('Login');
const colors = ['#686d76', '#3282b8', '#d9ecf2', '#64958f', '#ebecf1', '#e1f4f3'];
const colors2 = ['#eeeeee', '#e8ffff', '#f56a79', '#faf3dd', '#206a5d', '#706c61']; //nav

// Main Class for handling different functions
class Items {
    constructor(item) {
        this.name = item.name;
        this.itemCode = item.itemCode;
        this.cat = item.cat;
        this.price = item.price;
        this.qty = item.qty;
        this.src = item.image;
    }

    appendItem() {
        var template = jQuery('#Items-template').html();
        var html = Mustache.render(template, {
            name: this.name,
            code: this.itemCode,
            cat: this.cat,
            price: this.price,
            qty: this.qty,
            img: this.src
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
                    document.getElementsByClassName('q')[i].style.background = '#d2f5e3';
                    document.getElementsByClassName('p')[i].style.background = '#d2f5e3';
                    setTimeout(() => {
                        document.getElementsByClassName('q')[i].style.background = 'white';
                        document.getElementsByClassName('p')[i].style.background = 'white';
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
}

var arr = new Array();      // Array for Items

req.open('get', `/shop/${vId}`);
req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

req.onreadystatechange = function () {
    if (this.readyState === 4) {
        if (this.status === 200) {
            let resp = JSON.parse(this.responseText);
            jQuery('#user').text(resp.seller.email);
            addSellerDetails(resp);
            Update();
            Delete();
        }
        else {
            window.location.href = '/';
            alert('Invalid ShopId!!!');
        }
    }
}
req.send();
function addSellerDetails(obj) {
    var seller = obj.seller;
    var template = jQuery('#Details-template').html();
    var html = Mustache.render(template, {
        name: seller.addr.shopName,
        street: seller.addr.street,
        City: seller.addr.city,
        State: seller.addr.state,
        Pin: seller.addr.pin,
        Country: seller.addr.country,
        phone: seller.phone
    });

    jQuery('#Shop__details').append(html);
    let rand = (Math.floor(Math.random() * 100)) % colors.length;
    jQuery('#Shop__details').attr('style', `background:${colors[rand]}`);
    jQuery('#nav').attr('style', `background:${colors2[rand]}`);
    obj.items.forEach((item) => {
        let temp = new Items(item);
        arr.push(temp);
        arr[arr.length - 1].appendItem();
    });
}

Update = function () {
    var upItem = document.getElementsByClassName('Cart__Update');
    for (let i = 0; i < upItem.length; i++) {
        upItem[i].onclick = function () {
            let q = document.getElementsByClassName('q')[i].value;
            let p = document.getElementsByClassName('p')[i].value;
            arr[i].updaTeItem(p, q, i);
        }
    }
}
Delete = function () {
    var delCart = document.getElementsByClassName('Cart__Delete');
    for (let i = 0; i < delCart.length; i++) {
        delCart[i].onclick = function () {
            arr[i].deleteItem(i);
        }
    }
}

function addNewItem(data) {
    req.open('post', '/login/seller/item', true);
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.onreadystatechange = function () {
        if (this.readyState === 4)
            if (this.status === 200) {
                let item = JSON.parse(this.responseText);
                let temp = new Items(item);
                arr.push(temp);
                arr[arr.length - 1].appendItem();
                Update();
                Delete();
            }
            else
                alert(this.responseText);
    }
    req.send(data);
}

document.getElementById('Add').onclick = function () {
    jQuery('#Add').attr('disabled', 'disabled');
    jQuery('body').attr('style', 'overflow:hidden');
    jQuery('#newItem').attr('style', 'display:flex');
    jQuery('#cancel').on('click', function () {
        jQuery('body').attr('style', 'overflow:auto');
        jQuery('#newItem').attr('style', 'display:none');
        jQuery('#Add').removeAttr('disabled');
    });
    jQuery('#add').on('click', function () {
        let cat = document.getElementById('cat').value;
        let price = document.getElementById('price').value;
        let qty = document.getElementById('qty').value;
        let img = document.getElementById('itm-image').files[0];

        let data = new FormData();
        data.append('cat', cat);
        data.append('price', price);
        data.append('qty', qty);
        data.append('image', img);

        addNewItem(data);
    });
};