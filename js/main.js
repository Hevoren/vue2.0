let eventBus = new Vue()


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },

    template: `
        <div class="product">
        
            <div class="product-image">
                <img :src="image" :alt="altText" />
            </div>
            <div class="product-info">
                <h1>{{ title }}</h1>

                <p>{{ description }}</p>

                <p v-if="inventory > 10 && inStock">In stock</p>
                <p v-else-if="inventory <= 10 && inventory > 0 && inStock">Almost sold out!</p>
                <p class="outOfStock" v-else>Out of stock</p>
  
                <span>{{ sale }}</span>

                <info-tabs :shipping="shipping" :details="details"></info-tabs>

                <ul>
                    <li v-for="size in sizes">{{ size }}</li>
                </ul>
                
                
                <a :href="link">More products like this</a>
                
                <div
                        class="color-box"
                        v-for="(variant, index) in variants"
                        :key="variant.variantId"
                        :style="{ backgroundColor:variant.variantColor }"
                        @mouseover="updateProduct(index)"

                >
                </div>
                
                <div style="display: flex;">
                    <button v-on:click="addToCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Add to cart</button>
                    <button v-on:click="removeFromCart" :disabled="!inStock" :class="{ disabledButton: !inStock }">Remove from cart</button>
                </div>
            
            </div>
            <product-tabs :reviews="reviews"></product-tabs>
        </div>
 `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            description: "A pair of warm, fuzzy socks",
            selectedVariant: 0,
            altText: "A pair of socks",
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            onSale: true,
            inventory: 100,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            cart: 0,
            reviews: [],
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },

        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);

        },

        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },

    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },

        image() {
            return this.variants[this.selectedVariant].variantImage;
        },

        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },

        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' are on sale!'
            }
            return this.brand + ' ' + this.product + ' are not on sale'
        },

        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        },
    },


    mounted() {
        eventBus.$on('review-submitted', editedReview => {
            this.reviews.push(editedReview)
        })
    },
})


Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
    <ul>
      <li v-for="detail in details">{{ detail }}</li>
    </ul>
  `
})


Vue.component('product-review', {
    props: {
        review: {
            type: Object,
            required: false
        },
        reviewId: {
            type: Number,
            required: false
        }

    },

    template: `
    <form class="review-form" @submit.prevent="onSubmit">
        <p v-if="errors.length">
            <b>Please correct the following error(s):</b>
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </p>

        <p>
            <label for="name">Name:</label>
            <input value="" id="name" v-model="name" >
        </p>

        <p>
            <label for="review">Review:</label>
            <textarea id="review" v-model="revieww" ></textarea>
        </p>

        <p>
            <label for="rating">Rating:</label>
            <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        
        <p>Would you recommend this product?</p>
        <label class="vote" for="recommend">
            Yes
            <input id="recommend" type="radio" value="Yes" v-model="recommend"/>
        </label>
        <label class="vote" for="recommend">
            No
            <input id="recommend" type="radio" value="No" v-model="recommend"/>
        </label>

        <p>
            <input type="submit" value="Submit"> 
        </p>

    </form>

 `,
    data() {
        return {
            name: "",
            revieww: "",
            rating: "",
            recommend: "",
            errors: [],
            editMode: false,
        }
    },

    methods:{
        onSubmit() {
            this.errors = []
            if(this.name && this.revieww && this.rating && this.recommend) {

                let editedReview = {
                    name: this.name,
                    revieww: this.revieww,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', editedReview);
                this.editMode = false;
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.revieww) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommendation required.")
            }
        },
        cancelEdit() {
            this.editMode = false;
            this.name = this.review.name;
            this.rating = this.review.rating;
            this.revieww = this.review.revieww;
            this.recommend = this.review.recommend;
        },
    },
    mounted() {
        console.log(this.$el)
        this.name = this.review.name;
        this.rating = this.review.rating;
        this.revieww = this.review.revieww;
        this.recommend = this.review.recommend;
    },
})


Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false,
            default: [],
        },
    },

    template: `
    <div>   
        <ul>
            <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                :key="index" 
                @click="selectedTab = tab"
            >
                {{ tab }}
            </span>
        </ul>
        <div v-show="selectedTab === 'Reviews'">
            <div >
                <p v-if="!reviews.length">There are no reviews yet.</p>
                <ul v-else>
                    <button style="color: black; " v-if="reviews.length" v-on:click="sortReviewByReduce(reviews)">Sort by reduce</button>
                    <button style="color: black; " v-if="reviews.length" v-on:click="sortReviewByIncrease(reviews)">Sort by increase</button>
                    <li v-for="(review, index) in reviews" :key="index" v-if="reviews.length">
                        <div style="display: flex; flex-direction: row">
                            <button style="color: black;" v-if="reviews.length" v-on:click="editReviewBtn">Edit</button>
                            <button style="color: black;" v-if="reviews.length" v-on:click="closeEdit">Close</button>
                            <button style="color: black;" v-if="reviews.length" v-on:click="deleteReview(reviews, index)" >Delete Review</button>
                        </div>
                        <product-review v-if="editing" :review="review" :reviewId="index" @edit-review="editReview"></product-review>
                        <p>{{ review.name }}</p>
                        <p >Rating: {{ review.rating }}</p>
                        <p>{{ review.revieww }}</p>
                        <p >Recommend: {{ review.recommend }}</p>
                    </li>
                </ul>
            </div>
        </div>
        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review>
        </div>
    </div>           
    `,
    data() {

        return {
            editing: false,
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'  // ?????????????????????????????? ?? ?????????????? @click
        }

    },

    methods: {
        editReviewBtn() {
            this.editing = true
        },

        editReview(reviewId, editedReview) {
            this.reviews.splice(reviewId, 1, editedReview);
        },

        closeEdit(){
            this.editing = false
        },

        deleteReview(reviews, index) {
            reviews.splice(index, 1)
        },

        sortReviewByReduce() {
            this.reviews.sort((a, b) => b.rating - a.rating)
        },

        sortReviewByIncrease() {
            this.reviews.sort((a, b) => a.rating - b.rating)
        }

    }
})


Vue.component('info-tabs', {
    props: {
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
        <div>
      
        <ul>
          <span class="tabs" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
          >{{ tab }}</span>
        </ul>
        
        <div v-show="selectedTab === 'Shipping'">
            <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
        </div>
    
        </div>
    `,
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping'
        }
    }
})





let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },

        removeToCart(id) {
            this.cart.pop(id);

        }
    }
})