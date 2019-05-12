import React from 'react';
import { View, Image, Text} from 'react-native';
import {ListItem,Divider } from 'react-native-elements'
import COLOR from '../constants/Colors'
const Menu=[
    {
      id:0,
      name:'Profile',
      menuUrl:'account', 
      icon: 'account' ,
      type:'material-community',
      color:'#B47EB3'
    },
    // {
    //   id:0,
    //   name:'Home',
    //   menuUrl:'Home', 
    //   icon: 'home' ,
    //   type:'material-community',
    //   color:'#B47EB3'
    // },
    {
      id:1,
      name:'Users',
      menuUrl:'account', 
      icon: 'account-group' ,
      type:'material-community',
      color:'#B47EB3'
    },
    {
      id:2,
      name:'Wishlist',
      menuUrl:'Wishlist', 
      icon: 'heart' ,
      type:'material-community',
      color:'#B47EB3'
    },
    {
      id:3,
      name:'Sell',
      menuUrl:'Sell', 
      icon: 'store' ,
      type:'material-community',
      color:'#B47EB3'
    },
 
 
];

class MenuScreen extends React.Component {
  constructor(props){
      super(props);
  }
  render() {
    return(
      <View style={{flex:1,}}>
        <View style={styles.headerContainer}>
            <Image style={{marginTop:'20%'}} source={require('../assets/images/header.png')} />
        </View> 
        <Divider style={{ backgroundColor: 'gray', width:'100%' }} />
        <View style={styles.headerList}>
            {
                Menu.map((item)=>{
                    return(
                          <ListItem
                            leftIcon={{type:item.type ,name:item.icon, color:COLOR.primary}} 
                            key={item.id}
                            title={item.name}
                            titleStyle={{color:COLOR.primary, textAlign:'left'}}
                            containerStyle={styles.listStyle}
                            onPress={()=>this.props.navigation.navigate(item.menuUrl)}
                        /> 
                    )
                })
            }
        </View>
      </View>
    );
  }
}

const styles={
  headerContainer:{
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:COLOR.primary, 
    height:'35%',  
  },
  logoImageStyle:{
        marginTop:50,   
        alignSelf:'center',
  },
  listStyle:{
    borderColor:'#f2f2f2', 
    borderBottomWidth:1
  }, 
  headerList:{
    marginTop:10, 
    borderTopWidth: 0, 
    borderBottomWidth: 0, 
    borderTopColor: '#fff', 
    marginLeft:20, 
    height:'65%', 
    backgroundColor:'#fff'
  },
  spinnerStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }, 
}

export default MenuScreen;