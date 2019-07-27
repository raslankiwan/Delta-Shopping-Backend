import React from 'react';
import { createAppContainer, createStackNavigator } from 'react-navigation';
import LoginForm from '../components/LoginForm';
import HomeContent from '../components/HomeContent';
import AddForm from '../components/AddForm';
import LocalData from '../components/LocalData'

const RootStack = createStackNavigator(
  {
      Home: {
          screen: HomeContent,
      },
      Login: {
          screen: LoginForm,
      },
      Add: {
          screen: AddForm,
      },
      LocalData: {
        screen: LocalData
      }
  },
  {
      initialRouteName: 'Login',
      defaultNavigationOptions: {
          headerStyle: {
              backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
              fontWeight: 'bold',
          },
      },
  }
);

export default createAppContainer(RootStack)