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
const userInfo={}
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
      console.log('user at authaction',user)
      if(firebase.auth().currentUser.emailVerified) {
        firebase.database().ref(`/users/${user.user.uid}`)
        .on('value', snapshot => {
            console.log('snapshot at authaction',snapshot.val());
       
          user={...user, userInfo:{
            name:snapshot.val().name, 
            city:snapshot.val().city, 
            country:snapshot.val().country,
            email: snapshot.val().email,
            phone: snapshot.val().phone,
            street:snapshot.val().street,
            zip:snapshot.val().zip,
            uid:user.user.uid
          }}
          userInfo['info']=user;
          // console.log('uuuu', userInfo);
          UserLogin(dispatch, userInfo);
        });
        // console.log('after set user ', userInfo)
      
      } else {
        loginUserFail(dispatch, 'Email not verified');
      }
    })
    .catch(()=>loginUserFail(dispatch, 'Authentication Failed'));
  };


};

// export const createUser = (props) => {
//   const { email, name, zip, phone, country, street, city  } = props;

//   const { currentUser } = firebase.auth();
    
//     return(dispatch) => {

//         firebase.database().ref(`users/${currentUser.uid}/`)
//         .push({ name, phone, email, zip, country, street, city, 
//           photo:"https://firebasestorage.googleapis.com/v0/b/shopping-bfcfb.appspot.com/o/user.jpg?alt=media&token=36cb2651-3224-4c39-8608-abf282c2009f" 
//         })
//         .then(() => {
//           signUpUserSuccess(dispatch, user);
//         });     
//     };
// };

export const signUpUser = (props) => {
  const { email, password, name, zip, phone, country, street, city  } = props;
  return (dispatch) => {
    dispatch({ type: SIGN_UP_USER });

    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(user => {
      firebase.auth().currentUser.sendEmailVerification()
      .then(() => {
        // const { uid } = admin.auth().getUserByEmail(email);
        // console.log('register user', uid);
        // console.log('register user id', uid.uid);
        //firebase.auth().
        firebase.database().ref(`users/${firebase.auth().currentUser.uid}`)
        .push({ name, phone, email, zip, country, street, city, 
          photo: "https://firebasestorage.googleapis.com/v0/b/shopping-bfcfb.appspot.com/o/user.jpg?alt=media&token=36cb2651-3224-4c39-8608-abf282c2009f"
        })
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
  console.log('loginUserSuccess', user)
  dispatch({
    type: LOGIN_USER_SUCCESS,
    payload: user
  });
};
const  setUserCredintialInAsyncStorage= async (user)=>{
  // console.log('user AsyncStorage', user);
  const userInfo =  {
    uid:user.info.userInfo.uid, 
    email:user.info.userInfo.email, 
    name:user.info.userInfo.name, 
    city:user.info.userInfo.city, 
    country:user.info.userInfo.country,
    phone: user.info.userInfo.phone,
    street:user.info.userInfo.street,
    zip:user.info.userInfo.zip,
  };
  // console.log('set in async storage', userInfo)
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
