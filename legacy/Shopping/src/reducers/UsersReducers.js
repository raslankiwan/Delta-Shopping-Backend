import {
    USERS_FETCH, 
    USERS_FETCH_SUCCESS,
    USERS_FETCH_FAILED
} from '../actions/types';
// import console = require('console');

const INITIAL_STATE = {
    users: [],
    loading:false, 
    dataCount:0, 
    error:''
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case USERS_FETCH:
            return {...state, loading:true}
        case USERS_FETCH_SUCCESS:
            return {...state, users: action.payload.data, dataCount:action.payload.dataCount, loading:false};
        case USERS_FETCH_FAILED:
            return {...state, error: action.payload.error, loading:false}
        default: 
            return state;
    }
};