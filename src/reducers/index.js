import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import ProductReducers from './ProductReducers';
import UsersReducers from './UsersReducers';
import NotificationReducer from './NotificationReducer';
import AllProductsReducer from './AllProductsReducer'
export default combineReducers({
  auth: AuthReducer,
  users: UsersReducers,
  fetchNotifications: NotificationReducer,
  allProducts: AllProductsReducer,

  product: ProductReducers,
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
