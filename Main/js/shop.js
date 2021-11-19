console.log("Shop is Live");

const vId=sessionStorage.getItem('vId');
var req = new XMLHttpRequest();

// Main Class for handling different functions
class Items{
    constructor(item)
    {
        this.itemCode = item.itemCode;
        this.cat = item.cat;
        this.price = item.price;
        this.qty = item.qty;
        this.src = item.image
    }

    appendItem()
    {
        var template = jQuery('#Items-template').html();
        var html = Mustache.render(template, {
            code: this.itemCode,
            cat: this.cat,
            price: this.price,
            qty: this.qty,
            src:this.src
        });

        jQuery("#Shop__Items").append(html);
    }

    addToCart(q) {
        req.open('post','/cart/add', true);
        req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function(){
            if(this.readyState === 4)
                if(this.status === 200)
                    alert(this.responseText);
                else
                    alert(this.responseText);
        }
        req.send(`itemCode=${this.itemCode}&price=${this.price}&vId=${vId}&qty=${q}&shopName=${this.shopName}&image=${this.src}`);  
    }
};  //End of Class

var arr = new Array();      // Array for Items

req.open('get',`/shop/${vId}`);
req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

req.onreadystatechange = function(){
    if(this.readyState === 4)
    {
        if(this.status===200)
            {
                let seller = JSON.parse(this.responseText);
                addSellerDetails(seller);
                login();
                add();
                inc();
            }
        else
            {
                sessionStorage.removeItem('vId');
                history.back();
                alert('Invalid ShopId!!!');
            }
    }
}
req.send();

function login()
{
    let header = sessionStorage.getItem('x-auth');
    if(header)
    {
        req.open('get', '/login/user');
        req.setRequestHeader('x-auth', header);
        req.onreadystatechange = function(){
            if(this.readyState === 4)
            {
                if(this.status === 200)
                {
                    jQuery('.Cart__add').removeAttr('disabled');
                    let user = JSON.parse(this.responseText);
                    jQuery('#user').text(user.name);
                }                  
            }
        }
        req.send();
    }else
    {
        jQuery('.Cart__add').prop('disabled', 'disabled');
    }
}
function addSellerDetails(obj)
{
    var seller = obj.seller;
    var template = jQuery('#Details-template').html();
    var html = Mustache.render(template, {
        name: seller.addr.shopName,
        street: seller.addr.street,
        City: seller.addr.city,
        State: seller.addr.state,
        Pin: seller.addr.pin,
        Country: seller.addr.country,
        phone:seller.phone
    });

    jQuery('#address').append(html);
    obj.items.forEach((item) => {
        let temp = new Items(item);
        arr.push(temp);
        arr[arr.length-1].appendItem();
    });
}
function show () {              // While Logging in
    jQuery('#Login').attr('style','display:inline-flex');
    $('#Shop__Items').attr('style', 'filter:blur(1vw)');
    $('body').attr('style','overflow:hidden');
    $('#close').on('click', function () {
        // hide();
    });
}

add = function(){
    var addCart = document.getElementsByClassName('Cart__add');
    for(let i=0; i<addCart.length; i++)
    {
        addCart[i].onclick = function(){
       let q = parseInt(jQuery('.qty').eq(i).text());
            arr[i].addToCart(q);
        }
    }
}
jQuery('#Shop__Items').on('scroll', ()=>{
    // console.log(jQuery('#scroll').offset().top);
    if(jQuery('#scroll').offset().top<100)
    {
        jQuery('#address').css('display','none');
        jQuery('#ShopInfo img').css('height', '10vh');
        jQuery('#ShopInfo img').css('width', '10vh');
        jQuery('#Shop__Items').css('max-height','74vh');
    }
    else{
        jQuery('#address').css('display', 'block');
        jQuery('#ShopInfo img').css('height', '20vh');
        jQuery('#ShopInfo img').css('width', '20vh');
        jQuery('#Shop__Items').css('max-height', '58vh');
    }
});

const inc = function () {
    let n = document.getElementsByClassName('qty').length;
    for (let i = 0; i < n; ++i) {
        jQuery('.plus').eq(i).on('click', () => {
            let val = parseInt(jQuery('.qty').eq(i).text());
            console.log(val)
            jQuery('.qty').eq(i).text(Math.min(arr[i].qty, val + 1));
        });
        jQuery('.minus').eq(i).on('click', () => {
            let val = parseInt(jQuery('.qty').eq(i).text());
            console.log(val)
            jQuery('.qty').eq(i).text(Math.max(0, val - 1));
        });
    }
}