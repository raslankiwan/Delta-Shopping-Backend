// import React from 'react'
// import { Button } from 'react-native'
// import HomeContent from '../components/HomeContent'
// import LoginForm from '../components/LoginForm';
// import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';
// import AddForm from '../components/AddForm';

// const HeaderLeft = (navigation) => (
    
//     <Button
//         name='menu'
//         // size={30}
//         title ="Back"
//         onPress={()=>{navigation.navigate('Home')}}
//         // containerStyle={styles.headerIconsStyle}
//       />
// )

// const HeaderRight = (navigation) => (
      
//     <Button
//         name='settings'
//         title ="Add"
//         onPress={()=>{navigation.navigate('Add')}}
//         // containerStyle={styles.headerIconsStyle}
//       />
// )
  

// const HomeStack = createStackNavigator({
//     Home:{
//       screen: HomeContent, 
//       navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Home'), 
//     },
// });

// const AddStack = createStackNavigator({
//     Home:{
//       screen: AddForm, 
//       navigationOptions: ({navigation}) => menuNavicationOptions(navigation, 'Add'), 
//     },
// });

// menuNavicationOptions = (navigation, headerName) => {
//     return {
//       title: headerName,
//       headerLeft: HeaderLeft(navigation) ,
//       headerRight: HeaderRight(navigation),
//       headerTitleStyle :{textAlign: 'center', flex: 1},
//       headerStyle:{
//         backgroundColor: '#666677'
//       }, 
//       headerTintColor: '#fff',
//       // headerBackTitle:null, 
//     }
//   }


// const LoginStack = createStackNavigator({
//     Login:{
//         screen:LoginForm, 
//         navigationOptions:{
//         header:null, 
//         headerBackTitle:null, 
//         }
//     }
// });


// const Root = createBottomTabNavigator({
//     LoginForm:{screen: LoginStack},
//     Home:{screen: HomeStack},
//     Ad
// },
// {
//     defaultNavigationOptions: {
//         tabBarVisible: false, 
//         headerBackTitle: null,
//     },
// }
// );
// export default Root;