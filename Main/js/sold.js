console.log("checkouts Live");
var req = new XMLHttpRequest();

req.open('get', '/sold');
req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
req.onreadystatechange = function() {
    if(this.readyState === 4)
    {
    if(this.status === 200)
        {
            let data = JSON.parse(this.responseText);
            if(data.length)
                jQuery('#noOrders').attr('style', 'display:none');
            if(data[0])
            {
                data.forEach(element => {
                    addSoldOut(element);
                });
            }
        }
    }
}

function addSoldOut(c)
{
    var template = jQuery('#Item-template').html();
    var html = Mustache.render(template, {
      street: c.addr.street,
      city : c.addr.city,
      state : c.addr.state,
      pin : c.addr.pin,
      phone : c.phone,
      itemCode:c.item.itemCode,
      price : c.item.price,
      qty : c.item.qty,
      date : c.item.date,
      name: c.name
    });

    jQuery('#items').append(html);
}


req.send();
