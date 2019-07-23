import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import MainTabNavigator from './MainTabNavigator';
import LoginForm from '../components/LoginForm';
import HomeContent from '../components/HomeContent';
import AddForm from '../components/AddForm';


export default createAppContainer(createSwitchNavigator({
    // You could add another route here for authentication.

    // Read more at https://reactnavigation.org/docs/en/auth-flow.html
    Main: MainTabNavigator,
    Login: LoginForm,
    Home: HomeContent,
    Add: AddForm
  },
  {
    initialRouteName: 'Login'
  }));
