import {
  EMAIL_CHANGED,
  PASSWORD_CHANGED,
  NAME_CHANGED,
  COUNTRY_CHANGED,
  CITY_CHANGED,
  STREET_CHANGED, 
  ZIP_CHANGED, 
  PHONE_CHANGED, 
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_USER,
  SIGN_UP_USER_SUCCESS,
  SIGN_UP_USER_FAIL,
  SIGN_UP_USER,
  SET_LOADING_LOGIN_FORM, 
  USER_LOGOUT
} from '../actions/types';

const INITIAL_STATE = {
  email: 'raslankiwan@gmail.com',
  password: '123456r',
  name: '',
  phone: '',
  country: 'Palestine',
  user: null,
  error: '',
  loading: false,
  shouldRedirect: false, 
  loadingLogInForm:true, 
};

export default (state=INITIAL_STATE, action) => {
  switch(action.type) {
    case EMAIL_CHANGED:
      return { ...state, email: action.payload };
    case PASSWORD_CHANGED:
      return { ...state, password: action.payload };
    case COUNTRY_CHANGED:
      return { ...state, country: action.payload };
    case CITY_CHANGED:
      return { ...state, city: action.payload };
    case PHONE_CHANGED:
      return { ...state, phone: action.payload };
    case ZIP_CHANGED:
      return { ...state, zip: action.payload };
    case STREET_CHANGED:
      return { ...state, street: action.payload };
    case NAME_CHANGED:
      return { ...state, name: action.payload };
    case LOGIN_USER:
      return { ...state, loading: true, error:'' };
    case LOGIN_USER_SUCCESS:
      return { ...state, ...INITIAL_STATE, user: action.payload, shouldRedirect:true };
    case LOGIN_USER_FAIL:
      return { ...state, error: action.error, password: '', loading: false, shouldRedirect: false };
    case SIGN_UP_USER:
      return { ...state, loading: true, error:''};
    case SIGN_UP_USER_SUCCESS:
      return {...state, ...INITIAL_STATE, user: action.payload, shouldRedirect: true };
    case SIGN_UP_USER_FAIL:
      return { ...state, error: 'Registration Failed.', password: '', loading: false, shouldRedirect: false };
    case SET_LOADING_LOGIN_FORM:
      return {...state, loadingLogInForm:action.payload};
    case USER_LOGOUT:
      return { ...state, user:null,  loading:false, loadingLogInForm:false, shouldRedirect:false}
    default:
      return state;
  }
}
