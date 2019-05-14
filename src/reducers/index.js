import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import ProductReducers from './ProductReducers';
import UsersReducers from './UsersReducers';

export default combineReducers({
  auth: AuthReducer,
  userFetch: UsersReducers,
  fetchAllProducts: ProductReducers,
  productFetch: ProductReducers,
  cartFetch: ProductReducers,
  addToCart: ProductReducers,
  removeFromCart: ProductReducers,
  wishlistFetch: ProductReducers,
  addToWishlist: ProductReducers,
  removeFromWishlist: ProductReducers,
  incrementViews: ProductReducers,
  reviewChanged: ProductReducers,
  addReview: ProductReducers,
  reviewFetch: ProductReducers
});
