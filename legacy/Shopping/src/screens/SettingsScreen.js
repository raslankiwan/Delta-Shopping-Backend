import React from 'react';
import firebase from 'firebase';
import { View, AsyncStorage} from 'react-native';
import {ListItem,Divider } from 'react-native-elements'
import {logOutUser} from '../actions/AuthActions';
import { connect } from 'react-redux';
import I18n from '../language/i18n';
 class SettingsScreen extends React.Component {
  
  Logout= async()=> {
    firebase.auth().signOut();
    
    let logOut = await AsyncStorage.removeItem('userInfo');
    let xxx = await this.props.logOutUser();

    this.props.navigation.navigate('Login');
   
    // Expo.Updates.reload();
  }
  
  render() {
    return(

      <View style={{flex:1}}>
        <Divider style={{ backgroundColor: 'gray', width:'100%' }} />
        <View style={styles.headerList}>
{/*            
            <ListItem
              leftIcon={{type:'material-community', name:'account-settings'}} 
              key={1}
              title={I18n.t('AccountSettings')}
              // onPress={() => this.Logout()} 
              containerStyle={styles.listStyle}
              titleStyle={{textAlign:'left'}}
            /> */}
            <ListItem
              leftIcon={{ name:'language'}} 
              key={2}
              title={I18n.t('Language.ChangeLanguage')}
              onPress={  ()=>{this.props.navigation.navigate('changeLang');}  } 
              containerStyle={styles.listStyle}
              titleStyle={{textAlign:'left'}}
            />
           <ListItem
              leftIcon={{type:'material-community', name:'logout'}} 
              key={3}
              title={I18n.t('Logout')}
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


export default connect(null, {logOutUser })(SettingsScreen);
