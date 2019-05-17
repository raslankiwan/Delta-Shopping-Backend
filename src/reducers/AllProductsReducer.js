import {
    ALL_PRODUCT_FETCH , 
    ALL_PRODUCT_FETCH_SUCCESS,
    ALL_PRODUCT_FETCH_FAILED, 

} from '../actions/types';
const INITIAL_STATE = {
    data: [],
    loading:false, 
    dataCount:0, 
    error:''
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case ALL_PRODUCT_FETCH:
            return {...state, loading: true}   
        case ALL_PRODUCT_FETCH_SUCCESS:
            return {...state,loading: false, data: action.payload.data, dataCount: action.payload.dataCount};
        case ALL_PRODUCT_FETCH_FAILED:
            return {...state, loading: false, error: action.payload.error}
        default: 
            return state;
    }
};