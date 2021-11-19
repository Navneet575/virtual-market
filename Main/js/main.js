
var req = new XMLHttpRequest();
const login = document.getElementById('Login');
const signup = document.getElementById('SignUp');
const logout = document.getElementById('Logout');
const form = document.getElementById('form');
const form1 = document.getElementById('form1');
const Form = document.getElementById('Form');
const LSAfter = document.getElementById('LSAfter');
const LS = document.getElementById('LS');
const Mine = document.getElementById('Mine');
Form.style.display = 'none';

var req = new XMLHttpRequest();
var loggedIn = 0;
var flag = -1;  //-1=None, 0=login, 1=signup

login.onclick = function (e) {

    if (flag == -1) {
        Form.style.display = 'block';
        form.style.display = 'block';
        form1.style.display='none';
        flag = 0;
    } else if (flag == 0) {
        Form.style.display = 'none';
        flag = -1
    }
    else {
        flag = 0;
        form.style.display = 'block';
        form1.style.display = 'none';
    }
}

signup.onclick = function (e) {
    if (flag == -1) {
        Form.style.display = 'block';
        form1.style.display = 'block';
        form.style.display = 'none';
        flag = 1;
    } else if (flag === 1) {
        Form.style.display = 'none';
        flag = -1
    } else {
        flag = 1;
        form1.style.display = 'block';
        form.style.display = 'none';
    }

}
logout.onclick = function () {
    let req = new XMLHttpRequest();
    req.open('delete', '/login');
    req.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                Mine.style.display='none';
                LSAfter.style.display='none';
                LS.style.display='block';
                sessionStorage.clear();
            }
        }
    }
    req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
    req.send();
}
if (!loggedIn) {
    logIn();
    // To login/SignUp
    form.onsubmit = function (e) {
        e.preventDefault();
            req.open('POST', '/login', true);
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        let headers = this.getResponseHeader('x-auth');
                        sessionStorage.setItem('x-auth', headers);
                        let user = JSON.parse(this.responseText);
                        // console.log(user);
                        Mine.style.display='flex';
                        jQuery('#LSAfter h2').text(user.email);
                        LS.style.display='none';
                        LSAfter.style.display='block';
                        Form.style.display='none';
                        flag = -1;
                        var fName = user.name.split(' ')[0];
                        jQuery('#Mine h2').text(`Welcome,${fName}`);
                        if (user.desig === 'Customer') {
                            jQuery('#Mine a').eq(1).css({'display':'none'});
                        }
                        else if (user.desig === 'Seller') {
                            jQuery('#Mine a').eq(1).css({ 'display': 'block' });
                        }
                        searchByCity(user.addr.city, false);
                    }
                    else {
                        alert('Invalid Email or Password.');
                    }
                }
            }
            let user = `email=${(form.email.value).toLowerCase()}&password=${form.password.value}`;
            req.send(user);
    }
    // Signup AJAX
    form1.onsubmit = function(e){
            e.preventDefault();
            req.open('POST', '/signup', true);
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            req.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        alert('You are Successfully registered.')
                    }
                    else if (this.status === 400) {
                        alert('Email Already in Use.');
                    }
                }
            }
            let user = `email=${(form1.email.value).toLowerCase()}&password=${form1.password.value}&phone=${form1.phone.value}&name=${form1.name.value}&desig=${(form1.desig.checked ? 'Seller' : 'Customer')}`;

            req.send(user);
       
    }
}


// Get Shop
document.querySelector('#searchBar button').onclick = function () {
    let vId = document.querySelector('#searchBar input').value;
    vId = vId.toUpperCase();
    sessionStorage.setItem('vId', vId);
    document.querySelector('#searchBar input').value = null;
    window.location.href = './shop.html';
}


function logIn() {
    let header = sessionStorage.getItem('x-auth');
    if (header) {
        let req = new XMLHttpRequest();
        req.open('get', '/login/user');
        req.setRequestHeader('x-auth', header);
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let user = JSON.parse(this.responseText);
                    Mine.style.display='flex';
                    jQuery('#LSAfter h2').text(user.email);
                    LS.style.display = 'none';
                    LSAfter.style.display = 'block';
                    Form.style.display = 'none';
                    flag = -1;    
                    var fName = user.name.split(' ')[0];
                    jQuery('#Mine h2').text(`Welcome,${fName}`);
                    if (user.desig === 'Customer') {
                        jQuery('#Mine a').eq(1).css({ 'display': 'none' });
                    }
                    else if (user.desig === 'Seller') {
                        jQuery('#Mine a').eq(1).css({ 'display': 'block' });
                    }

                    searchByCity(user.addr.city);
                }
            }
        }
        req.send();
    } else {
        console.log('Not LoggedIn');
    }
}


jQuery('#loc-button').on('click', function () {
    let city = document.getElementsByClassName('loc-bar__input')[0].value;
    document.getElementsByClassName('loc-bar__input')[0].value = null;
    if (city) {
        searchByCity(city);
    }
    else
        alert('Enter a valid city');
});

function searchByCity(city) {
    city = city.toLowerCase();
    city = city[0].toUpperCase() + city.substr(1);
    jQuery('#ShopsTab h1').eq(0).text(`Shops in ${city}`);
    jQuery('#ShopsTab h2').eq(0).text(null);
    jQuery('#cards').html(null);
    req.open('get', `/shops/${city}`);
    req.onreadystatechange = function () {
        if (this.readyState === 4)
            if (this.status === 200) {
                let shops = JSON.parse(this.responseText);
                if (shops.length == 0)
                    {jQuery('#ShopsTab h2').eq(0).text('Unfortunately! There are no Shops Registered with us currently at this location.');
                    }
                else
                    addToList(shops, true);
            }
    }
    req.send();
}


addToList = function (shops) {
        jQuery('#ShopsTab #cards').html('');
        for (let i = 0; i < shops.length; i++) {
            var template = jQuery('#shop__card-template').html();
            var HTML = Mustache.render(template, {
                shopName: shops[i].shopName,
                vId: shops[i].vId
            });

            jQuery('#ShopsTab #cards').append(HTML);
            jQuery('.go').eq(i).on('click', function () {
                sessionStorage.setItem('vId', shops[i].vId);
                window.location.href = '/shop.html';
            });
        }
}
