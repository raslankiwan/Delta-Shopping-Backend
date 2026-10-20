import {
    NOTIFICATION_FETCH_SUCCESS
} from '../actions/types';
// import console = require('console');

const INITIAL_STATE = {
    notificationList: [],

};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case NOTIFICATION_FETCH_SUCCESS:
            //console.log('Home' ,action.payload);
            return {...state, notificationList: action.payload};
        default: 
            return state;
    }
};