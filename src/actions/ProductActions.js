import firebase from 'firebase';
import {
    PRODUCT_FETCH_SUCCESS,
    PRODUCT_VIEW
} from './types';

export const productFetch = () =>  {
    return (dispatch) => {
        firebase.database().ref('/categories/electronics/mobiles')
        .on('value', snapshot => {
            var products = [];
            snapshot.forEach(child => {
                products.push({
                    Title: child.val().Title,
                    Amount: child.val().Amount,
                    Price: child.val().Price,
                    Company: child.val().Company,
                    Info: child.val().Info,
                    Currency: child.val().Currency,
                    Image: child.val().Image,
                    productId: child.key                   
                });
            });
             dispatch({ type: PRODUCT_FETCH_SUCCESS, payload: products});
        });
    };
};

export const cartFetch = () => {
    const { currentUser } = firebase.auth();
    return (dispatch) => {
        firebase.database().ref(`/users/${currentUser.uid}/cart`)
        .on('value', snapshot => {
            snapshot.forEach(child => {
                console.log(child.val().productId);
                
            });
        }); 
    };
};

export const viewItem = (product) => {
    return (dispatch) => {
        dispatch({ type: PRODUCT_VIEW, payload: product});
    };
};