console.log("checkouts Live");
var req = new XMLHttpRequest();

req.open('get', '/checkouts');
req.setRequestHeader('x-auth', sessionStorage.getItem('x-auth'));
req.onreadystatechange = function() {
    if(this.readyState === 4)
    {
    if(this.status === 200)
        {
            let cout = JSON.parse(this.responseText);
            if(cout[0])
            {
                jQuery('#bought').attr('style','display:none');
                sessionStorage.setItem('vId', cout[0].vId);
                cout.forEach(element => {
                    addCheckOut(element);
                });
            }
        }
    }
}
req.send();

function addCheckOut(c)
{
    var template = jQuery('#CheckoutItem-template').html();
    var html = Mustache.render(template, {
        vId:c.vId,
        itemCode:c.item.itemCode,
        price: c.item.price,
        qty:c.item.qty,
        total:c.total,
        date:c.date
    });
    jQuery('#items').append(html);
    if(c.confirmed)
        jQuery('.confirmed').text('Order Confirmed');
}
