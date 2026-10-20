import React from 'react';
import {
  ListView,
  Text,
  AsyncStorage, 
  View
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { fetchNotifications } from '../actions';
import {Button, Icon, ListItem, Avatar} from 'react-native-elements'
import I18n from '../language/i18n';
import Colors from '../constants/Colors'
import moment from 'moment'

class NotificationScreen extends React.Component {
 
  state = {
    notificationList: [],
    user:''
  };

  async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});

    user = JSON.parse(user);

    this.props.fetchNotifications(user.uid);
  }

  createDataSource( _data ) {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      });
    this.dataSource = ds.cloneWithRows(_data);
  }
   
  renderRow(item) {
    const { Title, productId, ScreenName, UserName, notificationId, createdAt, isRead } = item;
    return(   
      <ListItem
      key={productId}
      leftAvatar={
        <Avatar
          size='medium'
          rounded
          icon={{name: 'bell', type: 'font-awesome'}}
          overlayContainerStyle={{backgroundColor:Colors.secondary}}
        />
      }
      title={Title}
      subtitle={moment(createdAt).startOf('m').fromNow()}
      titleStyle={styles.titleStyle}
      subtitleStyle={styles.subtitleStyle}
      containerStyle={isRead?styles.ListItemStyle:styles.NotReadListItemStyle}
      />
     
    );
  }



  render() {
    this.createDataSource(this.props.notificationList);
    return (
      <View style={{flex:1}}>
          <ListView
            enableEmptySections={true} 
            renderRow={(item) => this.renderRow(item)}
            dataSource={this.dataSource}
          />       
      </View>
    );
  }

}

const mapStateToProps = ({ fetchNotifications }) => {
  const  {notificationList} = fetchNotifications;
  
  return  {notificationList};
};

const styles={ 
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
  NotReadListItemStyle:{
    borderBottomColor:Colors.lightGray, 
    borderBottomWidth:1, 
    padding:5, 
    alignItems:'flex-start', 
    backgroundColor:'#f1e4e4'
  },
  subtitleStyle:{
    fontSize:16, 
    color:'#a0a0a0', 
    fontWeight:'400', 
  }
}
export default connect(mapStateToProps, { fetchNotifications })(NotificationScreen);