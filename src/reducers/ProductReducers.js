import {
    PRODUCT_FETCH, 
    PRODUCT_FETCH_SUCCESS,
    PRODUCT_FETCH_FAILED, 

    CART_FETCH_SUCCESS,
    ADD_TO_CART_SUCCESS,
    REMOVE_FORM_CART_SUCCESS,
    WISHLIST_FETCH_SUCCESS,
    ADD_TO_WISHLIST_SUCCESS,
    REMOVE_FORM_WISHLIST_SUCCESS,
    REVIEW_FETCH_SUCCESS,
    PRODUCT_VIEW,
    VIEW_INCREMENT,
    REVIEW_CHANGED,
    REVIEW_ADDED
} from '../actions/types';
// import console = require('console');

const INITIAL_STATE = {
    products: [],
    cartProducts: [],
    wishlistProducts: [],
    addedToCart: false,
    removedFromCart: false,
    addedToWishlist: false,
    removedFromWishlist: false,
    viewAdded: false,
    reviewAdded: false , 
    productLoading:false, 
  
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case PRODUCT_FETCH:
            return {...state, productLoading: true}
        case PRODUCT_FETCH_SUCCESS:
            return {...state, productLoading: false, products: action.payload};

        case CART_FETCH_SUCCESS:
            return {...state, cartProducts: action.payload};

        case ADD_TO_CART_SUCCESS:
            return {...state, addedToCart: true};
        case REMOVE_FORM_CART_SUCCESS:
            return{...state, removedFromCart: true};
        
        case WISHLIST_FETCH_SUCCESS:
            return {...state, wishlistProducts: action.payload};
        case ADD_TO_WISHLIST_SUCCESS:
            return{...state, addedToWishlist: true};
        case REMOVE_FORM_WISHLIST_SUCCESS:
            return{...state, removedFromWishlist: true};
        
        case PRODUCT_VIEW:
            return {INITIAL_STATE, product: action.payload};
        case VIEW_INCREMENT: 
            return {INITIAL_STATE, viewAdded: true};
        case REVIEW_CHANGED: 
            return {...state, review: action.payload}; 
        case REVIEW_ADDED: 
            return{ INITIAL_STATE, reviewAdded: true};
        case REVIEW_FETCH_SUCCESS:
            return {...state, reviews: action.payload};
        default: 
            return state;
    }
};