import {
    USERS_FETCH_SUCCESS
} from '../actions/types';
// import console = require('console');

const INITIAL_STATE = {
    users: [],
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case USERS_FETCH_SUCCESS:
            return {...state, users: action.payload};
        default: 
            return state;
    }
};