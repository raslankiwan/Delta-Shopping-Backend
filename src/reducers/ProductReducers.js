import {
    PRODUCT_FETCH_SUCCESS,
    CART_FETCH_SUCCESS,
    PRODUCT_VIEW,
    ADD_TO_CART_SUCCESS,
    REMOVE_FORM_CART_SUCCESS
} from '../actions/types';

const INITIAL_STATE = {
    products: [],
    addedToCart: false,
    removedFromCart: false
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case PRODUCT_FETCH_SUCCESS:
            //console.log('Home' ,action.payload);
            return {...state, products: action.payload};
        case CART_FETCH_SUCCESS:
            //console.log('cart', action.payload);
            return {...state, products: action.payload};
        case PRODUCT_VIEW:
            return {INITIAL_STATE, product: action.payload};
        case ADD_TO_CART_SUCCESS:
            return {INITIAL_STATE, addedToCart: true};
        case REMOVE_FORM_CART_SUCCESS:
            return{INITIAL_STATE, removedFromCart: true};
        default: 
            return state;
    }
};