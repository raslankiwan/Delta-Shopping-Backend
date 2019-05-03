import React from 'react';
import firebase from 'firebase';
import {ScrollView, View, Text, Image, AsyncStorage} from 'react-native';
import {Avatar,ListItem,Divider } from 'react-native-elements'
import {logOutUser} from '../actions/AuthActions';
import { connect } from 'react-redux';
import I18n from '../language/i18n';
 class SettingsScreen extends React.Component {
  
  Logout= async()=> {
    firebase.auth().signOut();
    
    let logOut = await AsyncStorage.removeItem('userInfo');
    this.props.navigation.navigate('Login');
    let xxx = await this.props.logOutUser();
  
  }
  
  render() {
    return(

      <View style={{flex:1}}>
        <Divider style={{ backgroundColor: 'gray', width:'100%' }} />
        <View style={styles.headerList}>
           
            <ListItem
              leftIcon={{ name:'language'}} 
              key={1}
              title={I18n.t('Language.ChangeLanguage')}
              onPress={  ()=>{this.props.navigation.navigate('changeLang');}  } 
              containerStyle={styles.listStyle}
              titleStyle={{textAlign:'left'}}
            />
           <ListItem
              leftIcon={{type:'material-community', name:'logout'}} 
              key={2}
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
const mapStateToProps = ({ productFetch }) => {
  const  {products, loading} = productFetch;
  
  return  {products, loading};
};

export default connect(mapStateToProps, {logOutUser })(SettingsScreen);
