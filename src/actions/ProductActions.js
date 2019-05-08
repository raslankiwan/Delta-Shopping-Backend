import firebase from 'firebase';
import {
    PRODUCT_FETCH_SUCCESS,
    CART_FETCH_SUCCESS,
    ADD_TO_CART_SUCCESS,
    REMOVE_FORM_CART_SUCCESS,
    WISHLIST_FETCH_SUCCESS,
    ADD_TO_WISHLIST_SUCCESS,
    REMOVE_FORM_WISHLIST_SUCCESS,
    PRODUCT_VIEW,
    VIEW_INCREMENT,
    REVIEW_FETCH_SUCCESS,
    REVIEW_CHANGED,
    REVIEW_ADDED
} from './types';
//import console = require('console');

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
                    Viewed: child.val().Viewed,
                    productId: path + '/' + child.key                   
                });
            });
            dispatch({ type: PRODUCT_FETCH_SUCCESS, payload: products});
        });
    };
};

export const cartFetch = (user) => {
    const uu= JSON.parse(user);

    return (dispatch) => {

        firebase.database().ref(`/users/${uu.uid}/cart`)
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

export const addToCart = (productId, user) => {
    const uu= JSON.parse(user);

    return() => {
        firebase.database().ref(`/users/${uu.uid}/cart`)
        .push({productId})
        .then(()=> {
            dispatch({ type: ADD_TO_CART_SUCCESS});
        });        
    };

};

export const removeFromCart = (productId, user) => {
    const uu= JSON.parse(user);
    
    return () => {
        firebase.database().ref(`/users/${uu.uid}/cart`)
        .on('value', snapshot=>{
            snapshot.forEach( child=>{
               if (child.val().productId  === productId) {
                firebase.database().ref(`/users/${uu.uid}/cart/${child.key}`)
                .remove()
                .then( () => {
                    console.log('removed ');
                    dispatch({ type: REMOVE_FORM_CART_SUCCESS});
                });
               }
            })
        })
       
    };
};

export const wishlistFetch = (user) => {
    const uu= JSON.parse(user);

    return (dispatch) => {

        firebase.database().ref(`/users/${uu.uid}/wishlist`)
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
            dispatch({ type: WISHLIST_FETCH_SUCCESS, payload: products});
        }); 
    };
};

export const addToWishlist = (productId, user) => {
    const uu= JSON.parse(user);

    return() => {
        firebase.database().ref(`/users/${uu.uid}/wishlist`)
        .push({productId})
        .then(()=> {
            dispatch({ type: ADD_TO_WISHLIST_SUCCESS});
        });        
    };

};

export const removeFromWishlist = (productId, user) => {
    const uu= JSON.parse(user);
    
    return () => {
        firebase.database().ref(`/users/${uu.uid}/wishlist`)
        .on('value', snapshot=>{
            snapshot.forEach( child=>{
               if (child.val().productId  === productId) {
                firebase.database().ref(`/users/${uu.uid}/wishlist/${child.key}`)
                .remove()
                .then( () => {
                    console.log('removed ');
                    dispatch({ type: REMOVE_FORM_WISHLIST_SUCCESS});
                });
               }
            })
        })
       
    };
};

export const viewItem = (product) => {
    console.log('view item action', product);
    return (dispatch) => {
        dispatch({ type: PRODUCT_VIEW, payload: product});
    };
};

export const incrementViews = (productId) => {
    return () => {
        console.log('productId', productId);
        firebase.database().ref(productId)
        .on('value', snapshot => {
            console.log(snapshot.val());
            let viewed = parseInt(snapshot.val().Viewed);
            viewed += 1;
            console.log('viewed', viewed);
            firebase.database().ref(`${productId}/`).set({Viewed: viewed});
            dispatch({ type: VIEW_INCREMENT});
        });
    }
};


export const reviewChanged = (text) => {
    return {
      type: REVIEW_CHANGED,
      payload: text
    };
};

export const addReview = (productId, review, user ) => {
    const uu= JSON.parse(user);

    return () => {
        firebase.database().ref(`${productId}/reviews`)
        .push({review:review, userId:uu.uid})
        .then(()=>{
            dispatch({ type: REVIEW_ADDED});
        });
    };
}

export const reviewFetch = (productId) => {
    return (dispatch) => {
        firebase.database().ref(`${productId}/reviews`)
        .on('value', snapshot => {
            var reviews = [];
            snapshot.forEach(child => {
                reviews.push({
                    userId: child.val().userId,
                    review: child.val().review                   
                });
            });
            dispatch({ type: REVIEW_FETCH_SUCCESS, payload: reviews});
        });
    }
};