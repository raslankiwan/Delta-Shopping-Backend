import React from 'react';
import {  
  StyleSheet,
  ListView,
  View,
  AsyncStorage, 
  ActivityIndicator
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import I18n from '../language/i18n';
import {Button, Avatar, ListItem} from 'react-native-elements'
import { usersFetch } from '../actions/UsersActions';
import { CardSection, Spinner } from '../components/common';
import Colors from '../constants/Colors'

class UsersScreen extends React.Component {
  
  
  state = {
    users: []
  };
  
  async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});

    this.props.usersFetch();
  }

  createDataSource( _data ) {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      });
    this.dataSource = ds.cloneWithRows(_data);
  }

  openChat(dstUser) {
    this.props.navigation.navigate('Chat', {dstUserId: dstUser.userId})
  }

  renderRow(dstUser) {
    const {  Name, userId, Photo } = dstUser;
    const uu = JSON.parse(this.state.user);
    console.log('user ',uu.uid);
    if (userId !== uu.uid) {
      return(  
        <ListItem
        key={userId}
        leftAvatar={
          <Avatar
            size='medium'
            rounded
            source={{uri:Photo}}
          />
        }
        title={Name}
        titleStyle={styles.titleStyle}
        containerStyle={styles.ListItemStyle}
        onPress={()=>this.openChat(dstUser)}
        /> 
      
      );
    } else {
      return (null);
    }
    
  }

  render() {
    console.log('props users', this.props)
    const {loading , users, dataCount} = this.props.users
    if(loading){
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <ActivityIndicator size='large' />
        </View>
      )
    }
      this.createDataSource(users);
      return (
        <View>
            <ListView
              enableEmptySections={true}
              renderRow={(item) => this.renderRow(item)}
              dataSource={this.dataSource}
              contentContainerStyle={{marginTop:8}}
            />       
  
        </View>
      );
    
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
  titleStyle:{
    color:Colors.primary, 
    fontSize:15, 
    fontWeight:'400'
  },
  btnStyle:{
    backgroundColor:Colors.primary, 
    width:70, 
    padding:5, 
  }, 
  ListItemStyle:{
    borderBottomColor:Colors.lightGray, 
    borderBottomWidth:1, 
    padding:5, 
    alignItems:'flex-start'
  }, 
});

const mapStateToProps = ({ users , auth}) => {
  const {user} = auth;
  return  { users, user };
};

export default connect(mapStateToProps, { usersFetch })(UsersScreen);