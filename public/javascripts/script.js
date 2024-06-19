//Ajax file 
/*
Ajax not working because the above script need to be run before
body sectiion. If we add this script section before the body  the loading
of webpage became slow. To avoid that we will add separate javascript file
in javascript folder and access it before body
*/
/*
To execute ajax file we need to add a ajax library in layout.hbs and 
call this javascript file there. 
 */
function addToCart(productId) {
    //console.log('inside function');
    //console.log(productId);
    $.ajax({
        //while clicking the button
        url: '/add-to-cart/' + productId,
        method: 'get',
        success: (response) => {
            if (response.status) {
                //accessing already have cart count (the cart count will be in string) and increasing
                let count = $('#cart-count').html()
                //parseInt: string convert into int 
                count = parseInt(count) + 1
                $('#cart-count').html(count)
            }
        }
    })
}
//change qunatity
function changeQuantity(cartId, productId, count) {
    let quantity = parseInt(document.getElementById(productId).innerHTML)
    count = parseInt(count)
    console.log('ajax');
    console.log(quantity);
    $.ajax({
        url: '/change-quantity/',
        data: {
            //data passing to url
            cart: cartId,
            product: productId,
            count: count,
            quantity: quantity
        },
        method: 'post',
        success: (response) => {
            if (response.removeProduct) {
                alert("Product Removed from cart")
                location.reload()
            } else {
                document.getElementById(productId).innerHTML = quantity + count
                //location.reload()
            }
        }
    })
}