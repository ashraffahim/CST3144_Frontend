const webstore = new Vue({
    el: '#app',
    data: {
        baseUrl: 'http://localhost:3000',
        backendRoutes: { productList: 'products', placeOrder: 'orders' },
        sitename: 'After School Activities',
        sitelogo: 'images/logo.png',
        currentPage: 'browse',
        filter: '',
        loadedAfterFilter: false,
        products: [],
        order: {
            sendGift: 'Send As A Gift',
            dontSendGift: 'Don\'t Send As A Gift',

            products: [],
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            state: '',
            zip: '',
            method: 'Home',
            gift: false,
        },

        states: {
            AL: 'Alabama',
            AR: 'Arizona',
            CA: 'California',
            NV: 'Nevada',
        },
    },
    methods: {
        addToCart: function (product) {
            this.order.products.push(product.id);
        },
        removeFromCart: function (product) {
            const newCart = [];

            this.order.products.forEach((productId, index) => {
                if (productId !== product.id) newCart.push(productId);
            });

            this.order.products = newCart;
        },
        increaseProductQty: function (product) {
            if (product.place - this.cartProductCount(product.id) === 0) {
                alert('Out of stock!');
                return;
            }

            this.order.products.push(product.id);
        },
        decreaseProductQty: function (product) {
            if (this.cartProductCount(product.id) === 0) {
                alert('Product is not in cart!');
                return;
            }

            this.order.products.splice(this.order.products.indexOf(product.id), 1);
        },
        submitForm: async function () {
            const response = await fetch(`${this.baseUrl}/${this.backendRoutes.placeOrder}`, {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.order)
            });

            if (!response.ok) {
                console.log('error');
            }

            const responseData = await response.json();

            console.log(responseData);
        },
        cartProductCount: function (id) {
            return this.order.products.filter(cartId => cartId === id).length;
        },
        applyFilter: function (evt) {
            this.filter = evt.target.value;
            this.loadedAfterFilter = false;
        },
        loadProductList: async function () {
            const response = await fetch(`${this.baseUrl}/${this.backendRoutes.productList}/${this.filter}`);

            if (!response.ok) {
                console.log('error');
                return [];
            }

            const responseData = await response.json();

            const newProducts = [];

            responseData.forEach(product => {
                newProducts.push(getproductstructure(product));
            });

            this.products = newProducts;
        }
    },
    computed: {
        sortedProducts() {
            if (!this.loadedAfterFilter) {
                this.loadProductList();
                this.loadedAfterFilter = true;
            }

            const productsArray = this.products.slice(0);
            function compare(a, b) {
                if (a.price > b.price)
                    return 1;
                else if (a.price < b.price)
                    return -1;
                return 0;
            }
            return productsArray.sort(compare);
        },
        productsInCart() {
            const cartIds = [...new Set(this.order.products)];
            const cartProducts = this.products.filter(product => cartIds.includes(product.id));
            return cartProducts;
        },
        cartTotalPrice() {
            let total = 0;
            let productIdToPrice = {};
            this.order.products.forEach(productId => {
                if (!productIdToPrice[productId]) {
                    productIdToPrice[productId] = this.products.find(product => product.id === productId);
                }

                total += productIdToPrice[productId].price;
            });

            return total;
        },
        checkoutFormIsValid() {
            let valid = true;
            ['firstName', 'lastName', 'address', 'city', 'state', 'zip'].forEach(field => {
                if (this.order[field] === '') valid = false;
            });
            return valid;
        }
    },
});

function getproductstructure(dataObject) {
    return {
        id: dataObject._id,
        name: '',
        description: '',
        rating: 0,
        price: 0,
        place: 0,
        ...dataObject
    }
};