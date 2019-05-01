import firebase from 'firebase';
import {
    PRODUCT_FETCH_SUCCESS,
    CART_FETCH_SUCCESS,
    PRODUCT_VIEW
} from './types';

export const productFetch = (path) =>  {
    return (dispatch) => {
        firebase.database().ref(path)
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
                    productId: path + '/' + child.key                   
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
            var products = [];
            snapshot.forEach(child => {
                const productId = child.val().productId;
                firebase.database().ref(productId).
                on('value', snap => {
                    products.push({
                        Title: snap.val().Title,
                        Amount: snap.val().Amount,
                        Price: snap.val().Price,
                        Company: snap.val().Company,
                        Info: snap.val().Info,
                        Currency: snap.val().Currency,
                        Image: snap.val().Image,
                        productId: productId                   
                    });
                });
            });
            dispatch({ type: CART_FETCH_SUCCESS, payload: products});
        }); 
    };
};

export const viewItem = (product) => {
    return (dispatch) => {
        dispatch({ type: PRODUCT_VIEW, payload: product});
    };
};