import firebase from 'firebase';
import {
    ALL_PRODUCT_FETCH , 
    ALL_PRODUCT_FETCH_SUCCESS,
    ALL_PRODUCT_FETCH_FAILED, 

    PRODUCT_FETCH, 
    PRODUCT_FETCH_SUCCESS,
    PRODUCT_FETCH_FAILED, 

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
import moment from 'moment'
//import console = require('console');

export const productFetch = (path) =>  {
    return async (dispatch) => {
        dispatch({type:PRODUCT_FETCH});
        try{
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
                        Rate: child.val().Rate,
                        SellerId: child.val().SellerId,
                        SellerName: child.val().SellerName,
                        Sold: child.val().Sold,
                        buyers: child.val().buyers,
                        productId: path + '/' + child.key                   
                    });
                });
                console.log('in action ', products)
                dispatch({
                     type: PRODUCT_FETCH_SUCCESS, 
                     payload: products, 
                        
                    });
            });
         
           
              
           
           
        } catch (error){
            console.log(error)
          
        }
        
    };
};


export const fetchAllProducts = () =>  {
    return async (dispatch) => {
        dispatch({type:ALL_PRODUCT_FETCH});
        try{
            firebase.database().ref('/categories')
            .on('value', snapshot => {
                var allProducts = [];
               // console.log('snapshot: ',snapshot.val());
                snapshot.forEach(child => {
                    //console.log('child: ', child.val())
                    child.forEach(ch => {
                        //console.log('ch: ', ch.val())
                        allProducts.push({
                            Title: ch.val().Title,
                            Amount: ch.val().Amount,
                            Price: ch.val().Price,
                            Company: ch.val().Company,
                            Info: ch.val().Info,
                            Currency: ch.val().Currency,
                            Image: ch.val().Image,
                            Viewed: ch.val().Viewed,
                            SellerId: ch.val().SellerId,
                            SellerName: ch.val().SellerName,
                            Sold: ch.val().Sold,
                            buyers: ch.val().buyers,
                            Rate: ch.val().Rate,
                            productId: '/' + snapshot.key + '/' + child.key + '/' + ch.key                   
                        });
                    })
                    if(allProducts.length>0){
                        dispatch({
                             type: ALL_PRODUCT_FETCH_SUCCESS, 
                             payload: {
                                 data:allProducts, 
                                 dataCount:allProducts.length
                                }
                            });
                    }else{
                        dispatch({ 
                            type: ALL_PRODUCT_FETCH_FAILED, 
                            payload: {
                                error:'firebase error', 
                                dataCount:0
                            }
                        });
                    }
                    //console.log('allProducts: ', allProducts);
                    // dispatch({ type: ALL_PRODUCT_FETCH_SUCCESS, payload: allProducts});     
                });
               
            });
        }catch(error){
            console.log(error)
        }
       
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
                        SellerId: snap.val().SellerId,
                        SellerName: snap.val().SellerName,
                        Sold: snap.val().Sold,
                        buyers: snap.val().buyers,
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
            firebase.database().ref(`${productId}/buyers/`)
            .push({id:uu.uid, Username: uu.name});
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
                        SellerId: snap.val().SellerId,
                        SellerName: snap.val().SellerName,
                        Sold: snap.val().Sold,
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

export const addReview = (productId,  SellerId, SellerName, review, user ) => {
    const uu= JSON.parse(user);
    console.log('uu', uu);
    return () => {
        firebase.database().ref(`${productId}/reviews`)
        .push({review:review, userId:uu.uid, username: uu.name})
        .then(()=>{
            var now = moment().format();
            firebase.database().ref('/notification')
            .push({
                UserId: SellerId,
                Username: SellerName,
                Title:`${uu.name} added a review to your product`,
                productId,
                ScreenName: 'PDP',
                createdAt: now
            });
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
                    review: child.val().review,
                    username: child.val().username
                });
            });
            dispatch({ type: REVIEW_FETCH_SUCCESS, payload: reviews});
        });
    }
};