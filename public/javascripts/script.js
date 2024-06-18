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
                let count=$('#cart-count').html()
                //parseInt: string convert into int 
                count=parseInt(count)+1
                $('#cart-count').html(count)
            } 
        }
    })
}