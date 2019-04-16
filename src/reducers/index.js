import { combineReducers } from 'redux';
import AuthReducer from './AuthReducer';
import ProductFetchReducer from './ProductFetchReducers'

export default combineReducers({
  auth: AuthReducer,
  productFetch: ProductFetchReducer
});
