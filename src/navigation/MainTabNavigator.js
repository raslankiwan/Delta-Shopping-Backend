import React from 'react'
import HomeContent from '../components/HomeContent'
import LoginForm from '../components/LoginForm';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

const HomeStack = createStackNavigator({
    Home:{
      screen: HomeContent, 
      navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Home'), 
    },
});


const LoginStack = createStackNavigator({
Login:{
    screen:LoginForm, 
    navigationOptions:{
    header:null, 
    headerBackTitle:null, 
    }
}
});


const Root = createBottomTabNavigator({
LoginForm:{screen: LoginStack},
MainNavigation:{screen: HomeStack},

},
{
defaultNavigationOptions: {
    tabBarVisible: false, 
    headerBackTitle: null,
},
}
);
export default Root;