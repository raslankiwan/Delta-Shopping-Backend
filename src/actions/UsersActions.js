import firebase from 'firebase';
import {
    USERS_FETCH, 
    USERS_FETCH_SUCCESS,
    USERS_FETCH_FAILED
    
} from './types';

export const usersFetch = () => {
    return async (dispatch) => {
        dispatch({type:USERS_FETCH});
        try{
            firebase.database().ref('/users')
            .on('value', snapshot => {
    
                var users = [];
                snapshot.forEach(child => {
                    users.push({
                        Name: child.val().name,
                        Phone: child.val().phone,
                        Email: child.val().email,
                        Photo: child.val().photo,
                        Street: child.val().street,
                        Zip: child.val().zip,
                        City: child.val().city,
                        Country: child.val().country,
                        userId: child.key                   
                    });
                });
                if(users.length>0){
                    dispatch({
                         type: USERS_FETCH_SUCCESS, 
                         payload: {
                             data:users, 
                             dataCount:users.length
                            }
                        });
                }else{
                    dispatch({ 
                        type: USERS_FETCH_FAILED, 
                        payload: {
                            error:'firebase error', 
                            dataCount:0
                        }
                    });
                }
                // console.log('user: usersFetch', users);
                // dispatch({ type: USERS_FETCH_SUCCESS, payload: users});
            });
        }catch(error){

        }
   
    };
};