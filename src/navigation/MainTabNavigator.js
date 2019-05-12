import React from 'react';
import { Platform } from 'react-native';
import {Icon} from 'react-native-elements';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import WishlistScreen from '../screens/WishlistScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import SellScreen from '../screens/SellScreen';
import SearchResultScreen from '../screens/SearchResultScreen';
import COLOR from '../constants/Colors';
import RegisterScreen from '../screens/Register'
import MenuScreen from '../screens/MenuScreen';
import PDP from '../screens/PDP';
import ChangeLanguageScreen from '../screens/ChangeLanguageScreen';
import i18n from '../language/i18n'
import Category from '../screens/Category';
import SellingForm from '../screens/SellingForm';
import NotificationList from '../screens/NotificationList'
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
  },
  // Category:{
  //   screen:Category, 
  //   navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Category'), 
  // },
  // SearchResult:{
  //   screen:SearchResultScreen, 
  //   navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'SearchResult'), 
  // },
  // PDP:{
  //   screen:PDP, 
  //   navigationOptions: ({navigation}) => singleNavicationOptions(navigation, 'Product'), 
  // } 
});

const CategoryStack = createStackNavigator({
  Category:{
    screen:Category, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Category'), 
  },
  PDP:{
    screen:PDP, 
    navigationOptions: ({navigation}) => singleNavicationOptions(navigation, 'Product'), 
  } 
 
});

const SearchResultStack = createStackNavigator({
  SearchResult:{
    screen:SearchResultScreen, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'SearchResult'), 
  },
  // PDP:{
  //   screen:PDP, 
  //   navigationOptions: ({navigation}) => singleNavicationOptions(navigation, 'Product'), 
  // } 
 
});

const CartStack = createStackNavigator({
  Cart: {
    screen:CartScreen, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Cart')
  },
});

const WishlistStack = createStackNavigator({
  Wishlist: {
    screen: WishlistScreen, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Wishlist')
  },
});

const SellStack = createStackNavigator({
  Sell: {
    screen: SellScreen, 
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Sell')
  },
  SellForm:{
    screen:SellingForm, 
    navigationOptions: ({navigation}) => singleNavicationOptions(navigation, 'SellingFrom'), 
  }
});

const SettingsStack = createStackNavigator({
  Settings:{
    screen: SettingsScreen,
    navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Settings')
  }, 
  changeLang:{
    screen:ChangeLanguageScreen, 
    navigationOptions: ({navigation}) => singleNavicationOptions(navigation, 'Language'), 
  }
});

menuNavicationOptions = (navigation, headerName) => {
  return {
    title: i18n.t('Screens.'+headerName)  ,
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
       
      title: i18n.t('Screens.'+headerName)  ,
       headerBackTitle: null,
    
       headerStyle:{
         backgroundColor:COLOR.primary
       },
       headerTintColor: '#fff',
      
       
       
     } 
}
const MenuStack = createStackNavigator({
  Home:{screen:HomeStack},
  Sell: {screen:SellStack}, 
  Category:{screen:CategoryStack}, 
  searchResult:{screen:SearchResultStack}
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
  SettingsScreen:SettingsStack,

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
  cart: CartStack,
  wishlist: WishlistStack, 
  Notification:NotificationList
},
{
  defaultNavigationOptions: ({ navigation }) => ({
    tabBarIcon: ({ focused }) => {
      const { routeName } = navigation.state;
     
      if (routeName === 'Home') {
        return  (<TabBarIcon 
                    focused={focused} 
                    name={Platform.OS === 'ios' ? 'ios-home' : 'md-home'}
                 />
                 );
      } else if (routeName === 'cart') {
          return (<TabBarIcon
                    focused={focused}
                    name={Platform.OS === 'ios' ? 'ios-cart' : 'md-cart'}
                  />
                  );
      } else if (routeName === 'wishlist') {
        return (<TabBarIcon
                  focused={focused}
                  name={Platform.OS === 'ios' ? 'ios-heart' : 'md-heart'}
                />
                );
      }else if (routeName === 'Notification') {
        return (<TabBarIcon
                  focused={focused}
                  name={Platform.OS === 'ios' ? 'ios-notifications' : 'md-notifications'}
                />
                );
      }
      
    },
    tabBarOnPress:({navigation}) => {
      const { routeName } = navigation.state;
      if (routeName === 'Home') {
        navigation.navigate('Home');
      } else if (routeName === 'cart') {
        navigation.navigate('Cart');
      } else if (routeName === 'wishlist') {
        navigation.navigate('Wishlist');
      }else if (routeName === 'Notification') {
        navigation.navigate('Notification');
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
