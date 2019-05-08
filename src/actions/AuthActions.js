import firebase from 'firebase';
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
  USER_LOGOUT,
  USER_CREATE
} from './types';
import {AsyncStorage} from 'react-native';
export const emailChanged = (text) => {
  return {
    type: EMAIL_CHANGED,
    payload: text
  };
};

export const passwordChanged = (text) => {
  return {
    type: PASSWORD_CHANGED,
    payload: text
  };
};

export const nameChanged = (text) => {
  return {
    type: NAME_CHANGED,
    payload: text
  };
};

export const cityChanged = (text) => {
  return {
    type: CITY_CHANGED,
    payload: text
  };
};

export const phoneChanged = (text) => {
  return {
    type: PHONE_CHANGED,
    payload: text
  };
};

export const zipChanged = (text) => {
  return {
    type: ZIP_CHANGED,
    payload: text
  };
};

export const streetChanged = (text) => {
  return {
    type: STREET_CHANGED,
    payload: text
  };
};

export const countryChanged = (text) => {
  return {
    type: COUNTRY_CHANGED,
    payload: text
  };
};

export const loginUser = ({ email, password }) => {
  return (dispatch) => {
    dispatch({ type: LOGIN_USER});

    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(user => {
      if(firebase.auth().currentUser.emailVerified) {
       UserLogin(dispatch, user);
      } else {
        loginUserFail(dispatch, 'Email not verified');
      }
    })
    .catch(()=>loginUserFail(dispatch, 'Authentication Failed'));
  };


};

export const createUser = (props) => {
  const { email, name, zip, phone, country, street, city  } = props;
  console.log(name);
  const { currentUser } = firebase.auth();
    
    return(dispatch) => {
        firebase.database().ref(`users/${currentUser.uid}/`)
        .push({ name, phone, email, zip, country, street, city })
        .then(() => {
          signUpUserSuccess(dispatch, user);
        });     
    };
};

export const signUpUser = (props) => {
  const { email, password, name, zip, phone, country, street, city  } = props;
  return (dispatch) => {
    dispatch({ type: SIGN_UP_USER });

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
      firebase.auth().currentUser.sendEmailVerification()
      .then(() => {
        firebase.database().ref(`users/`)
        .push({ name, phone, email, zip, country, street, city, cartTotal: 0 })
        .then(() =>   signUpUserSuccess(dispatch, user));
      
      })    
    })
    .catch(() => signUpUserFail(dispatch));
  };
};

const UserLogin=(dispatch, user)=>{
  setUserCredintialInAsyncStorage(user);
  loginUserSuccess(dispatch, user);

}

const loginUserFail = (dispatch, error) => {
  
  dispatch({ type: LOGIN_USER_FAIL, error });
};

const loginUserSuccess = (dispatch, user ) => {
  dispatch({
    type: LOGIN_USER_SUCCESS,
    payload: user
  });
};
const  setUserCredintialInAsyncStorage= async (user)=>{
  // console.log('user AsyncStorage', user);
  const userInfo =  {
    uid:user.user.uid, 
    email:user.user.email
  };
  const res2 = await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
}
const signUpUserSuccess = (dispatch, user ) => {
  dispatch({
    type: SIGN_UP_USER_SUCCESS,
    payload: user
  });
};

const signUpUserFail = (dispatch) => {
  dispatch({ type: SIGN_UP_USER_FAIL});
};

export const setLoadingLogInForm = (boolean = false) => {
  return {
    type:SET_LOADING_LOGIN_FORM,
    payload:boolean
  }
}
export const logOutUser = () => {

  return async (dispatch) => {

    let logOut = await AsyncStorage.removeItem('userInfo');

    dispatch({
      type:USER_LOGOUT
    })
  }
}
