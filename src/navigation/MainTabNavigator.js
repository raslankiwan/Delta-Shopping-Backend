import React from 'react';
import { Platform } from 'react-native';
import {Icon} from 'react-native-elements';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import COLOR from '../constants/Colors';
import RegisterScreen from '../screens/Register'
import MenuScreen from '../screens/MenuScreen';
const HeaderLeft = (navigation) => (
    
  <Icon
      name='menu'
      size={30}
      onPress={()=>{navigation.navigate('MenuScreen')}}
      containerStyle={styles.headerIconsStyle}
      color='#fff'
    />
)
const HeaderRight = (navigation) => (
    
  <Icon
      name='settings'
      size={30}
      onPress={()=>{navigation.navigate('SettingsScreen')}}
      containerStyle={styles.headerIconsStyle}
      color='#fff'
    />
)
styles = {
  headerIconsStyle:{
    marginLeft:15,
    marginRight:15, 
 
  }
}
const HomeStack = createStackNavigator({
  Home:{
    screen:HomeScreen, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Home'), 
  } 
 
});


const CartStack = createStackNavigator({
  Cart: {
    screen:CartScreen, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Cart')
  },
});



const SettingsStack = createStackNavigator({
  Settings:{
    screen: SettingsScreen,
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Settings')
  }
});

menuNavicationOptions = (navigation, headerName) => {
  return {
    title: headerName ,
    headerLeft: HeaderLeft(navigation) ,
    headerRight: HeaderRight(navigation),
    headerTitleStyle :{textAlign: 'center', flex: 1},
    headerStyle:{
      backgroundColor:COLOR.primary
    }, 
    headerTintColor: '#fff',
    // headerBackTitle:null, 
  }
}
singleNavicationOptions = (navigation, headerName) => {
  return {
       
       title:headerName,
       headerBackTitle: null,
    
       headerStyle:{
         backgroundColor:COLOR.primary
       },
       headerTintColor: '#fff',
      
       
       
     } 
}
const MenuStack = createStackNavigator({
  Home:{screen:HomeStack},
},
{
  headerMode:'none',
  navigationOptions:{
    headerVisible:false,
    // headerBackTitle:null
  }
});
const integrateTabs = createBottomTabNavigator ({
  MainHome:{screen: HomeStack},
  Menu:{screen: MenuStack},
  MenuScreen:MenuScreen, 
  SettingsScreen:SettingsStack
},
{
  defaultNavigationOptions:{
    tabBarVisible: false,
    headerStyle:{
      backgroundColor:COLOR.primary
    }
  }
});

const Tabs = createBottomTabNavigator ({
  Home: integrateTabs,
  cart:CartStack,
},
{
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) => {
      const { routeName } = navigation.state;
     
      if (routeName === 'Home') {
        return  <TabBarIcon 
                 focused={focused} 
                 name={Platform.OS === 'ios' ? 'ios-home' : 'md-home'}
                 />;
      }else if(routeName === 'cart'){
        return    <TabBarIcon
                    focused={focused}
                    name={Platform.OS === 'ios' ? 'ios-cart' : 'md-cart'}
                  />;
      }

    },
    tabBarOnPress:({navigation}) => {
      const { routeName } = navigation.state;
      if (routeName === 'Home') {
        navigation.navigate('Home');
      }else if(routeName === 'cart'){
        navigation.navigate('Cart');
      }
    }
  }),
  tabBarOptions: {
    inactiveTintColor: 'gray',
    showLabel:false
  },

}
);



const LoginStack = createStackNavigator({
  Login:{
    screen:LoginScreen, 
    navigationOptions:{
      header:null, 
      headerBackTitle:null, 
    }
  }, 
  RegisterScreen:{
    screen:RegisterScreen, 
    navigationOptions: ({navigation}) => singleNavicationOptions(navigation, 'Register')
  }
});



const Root = createBottomTabNavigator({
  LoginForm:{screen: LoginStack},
  MainNavigation:{screen: Tabs},

},
{
 defaultNavigationOptions: {
     tabBarVisible: false, 
     headerBackTitle: null,
  },
   
}
);
export default Root;
// export default createBottomTabNavigator({
//   HomeStack,
//   CartStack,
//   SettingsStack,
// });
