import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import ProductReducers from './ProductReducers';

export default combineReducers({
  auth: AuthReducer,
  productFetch: ProductReducers,
  cartFetch: ProductReducers,
  addToCart: ProductReducers
});
