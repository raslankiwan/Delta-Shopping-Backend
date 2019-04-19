import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginScreen from '../screens/LoginScreen';
import Register from '../screens/Register';
import PDP from '../screens/PDP';


export default createAppContainer(createSwitchNavigator({
    // You could add another route here for authentication.
    
    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    Login: LoginScreen,
    Register: Register,
    PDP: PDP
  }, 
  {
    initialRouteName: 'Login'
  }));