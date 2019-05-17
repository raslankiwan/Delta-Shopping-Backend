import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import ProductReducers from './ProductReducers';
import UsersReducers from './UsersReducers';
import NotificationReducer from './NotificationReducer';

export default combineReducers({
  auth: AuthReducer,
  userFetch: UsersReducers,
  fetchNotifications: NotificationReducer,
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
