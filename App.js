import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import firebase from 'firebase';
import AppNavigator from './src/navigation/AppNavigator';
import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';
import registerForNotifications from './src/services/push_notifications';
import {Notifications} from 'expo';
import { Provider } from 'react-redux';
import reducers from './src/reducers';
console.disableYellowBox = true;

export default class App extends React.Component {
  componentWillMount() {
    const config = {
        apiKey: 'AIzaSyBnm1Qn1S_JjbdnluH2hwnF34hRbuyuLwo',
        authDomain: 'shopping-bfcfb.firebaseapp.com',
        databaseURL: 'https://shopping-bfcfb.firebaseio.com',
        projectId: 'shopping-bfcfb',
        storageBucket: 'shopping-bfcfb.appspot.com',
        messagingSenderId: '581074187585'
    };
    firebase.initializeApp(config);
  }
  
  state = {
    isLoadingComplete: false,
    notification: {},
  };


  componentDidMount(){
    // this.NotificationsRegister();
  }

  // NotificationsRegister = () =>{
  //     registerForNotifications();
  //     Notifications.addListener((notification) => {
  //     console.log('notif:', notification);
  //     this.setState({notification: notification});
  //     console.log('notification:', notification);

  //   });
  // }


  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (

        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <Provider store = { createStore(reducers, {}, applyMiddleware(ReduxThunk)) } >
            <AppNavigator />  
          </Provider>  
          
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./src/assets/images/robot-dev.png'),
        require('./src/assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./src/assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
