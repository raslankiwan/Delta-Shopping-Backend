import React from 'react';
import {
  ListView,
  Text,
  Image,
  TouchableHighlight, 
  AsyncStorage, 
  View
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { fetchNotifications } from '../actions';
import {Button, Icon} from 'react-native-elements'
import I18n from '../language/i18n';
import Colors from '../constants/Colors'


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
    const { Title, productId, ScreenName, UserName, notificationId, createdAt } = item;
    return(   
      <View style={styles.productContainer} id={notificationId}>
       


        <View style={styles.descWrapper}>
            <Text style={styles.titleStyle}>{Title}</Text>
            <Text style={styles.titleStyle}>{createdAt}</Text>
           
        </View>

      
         
      </View>
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
  productContainer:{
    flexDirection:'row', 
    width:'90%',
    padding:5, 
    backgroundColor:'white', 
    shadowColor: '#e5e6e8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 6, 
    elevation:5, 
    margin:8, 
    borderColor:'#e5e6e8', 
    borderWidth:1, 
    borderRadius:5, 
  } ,
  btnWrapper:{
    flexDirection:'row', 
    justifyContent:'space-around', 
    marginTop:5
  }, 
  imageWrapper:{
    width:'30%', 
    margin:5, 
  }, 
  descWrapper:{
    width:'60%', 
    margin:5
  }, 
  titleStyle:{
    color:Colors.primary, 
    fontSize:20, 
    fontWeight:'600'
  },
  priceStyle:{
    color:Colors.secondary, 
    fontSize:20, 
    fontWeight:'400'
  }, 
  btnStyle:{
    backgroundColor:Colors.primary, 
    width:70, 
    padding:5, 
  }

}
export default connect(mapStateToProps, { fetchNotifications })(NotificationScreen);