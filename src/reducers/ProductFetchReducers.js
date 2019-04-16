import {
    PRODUCT_FETCH_SUCCESS,
    PRODUCT_VIEW
} from '../actions/types';

const INITIAL_STATE = {
    products: [],
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case PRODUCT_FETCH_SUCCESS:
            return {...state, products: action.payload};
        case PRODUCT_VIEW:
            return {INITIAL_STATE, product: action.payload};
        default: 
            return state;
    }
};