import React from 'react';
import firebase from 'firebase';
import {ScrollView, View, Text, Image, AsyncStorage} from 'react-native';
import {Avatar,ListItem,Divider } from 'react-native-elements'
 class SettingsScreen extends React.Component {
  
  Logout() {
    firebase.auth().signOut();
    this.props.navigation.navigate('Login');
  }
  
  render() {
    return(

      <View style={{flex:1}}>
        <Divider style={{ backgroundColor: 'gray', width:'100%' }} />
        <View style={styles.headerList}>
           
            <ListItem
              leftIcon={{ name:'language'}} 
              key={1}
              title='ChangeLanguage'
              // onPress={  ()=>{this.props.navigation.navigate('ChangeLanguage');}  } 
              containerStyle={styles.listStyle}
              titleStyle={{textAlign:'left'}}
            />
           <ListItem
              leftIcon={{type:'material-community', name:'logout'}} 
              key={2}
              title='Logout'
              onPress={() => this.Logout()} 
              containerStyle={styles.listStyle}
              titleStyle={{textAlign:'left'}}
            />
        </View>

      </View>
    );
  }
}
const styles={
  headerContainer:{
		justifyContent:'center',
    alignItems:'center',
    backgroundColor:'#005cc8', 
    height:'35%'
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
  }
}

export default SettingsScreen;