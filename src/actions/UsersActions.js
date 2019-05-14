import firebase from 'firebase';
import {
    USERS_FETCH_SUCCESS,
    
} from './types';

export const usersFetch = () => {
    return (dispatch) => {
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
            console.log('user: usersFetch', users);
            dispatch({ type: USERS_FETCH_SUCCESS, payload: users});
        });
    };
};