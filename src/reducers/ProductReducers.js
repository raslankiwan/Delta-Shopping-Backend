import {
    PRODUCT_FETCH_SUCCESS,
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

const INITIAL_STATE = {
    products: [],
    addedToCart: false,
    removedFromCart: false,
    addedToWishlist: false,
    removedFromWishlist: false,
    viewAdded: false,
    reviewAdded: false 
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case PRODUCT_FETCH_SUCCESS:
            //console.log('Home' ,action.payload);
            return {...state, products: action.payload};
        case CART_FETCH_SUCCESS:
            //console.log('cart', action.payload);
            return {...state, products: action.payload};

        case ADD_TO_CART_SUCCESS:
            return {INITIAL_STATE, addedToCart: true};
        case REMOVE_FORM_CART_SUCCESS:
            return{INITIAL_STATE, removedFromCart: true};
        
        case WISHLIST_FETCH_SUCCESS:
            return {...state, products: action.payload};
        case ADD_TO_WISHLIST_SUCCESS:
            return{INITIAL_STATE, addedToWishlist: true};
        case REMOVE_FORM_WISHLIST_SUCCESS:
            return{INITIAL_STATE, removedFromWishlist: true};
        
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