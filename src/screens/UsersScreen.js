import React from 'react';
import {  
  StyleSheet,
  ListView,
  View,
  Text,
  Image,
  TouchableHighlight,
  AsyncStorage
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import I18n from '../language/i18n';
import {Button, Icon, Card} from 'react-native-elements'
import { usersFetch } from '../actions/UsersActions';
import { CardSection, Spinner } from '../components/common';
// import console = require('console');

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
    this.props.navigation.navigate('Chat', {dstUser})
  }

  renderRow(dstUser) {
    console.log('user: renderRow', dstUser);
    const {  Name, userId, Photo } = dstUser;
    return(   
      <TouchableHighlight onPress={()=>this.openChat(dstUser)}>
        <View style={styles.productContainer} id={userId}>
          <View style={styles.imageWrapper}>
              <Image
                  style={{width: '25%', height: 100}}
                  source={{uri: Photo }}
                />
          </View>

          <View style={styles.descWrapper}>
              <Text style={styles.titleStyle}>{Name}</Text>
              <Text style={styles.titleStyle}>{userId}</Text>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  render() {
    
      console.log('created',this.props.users);
      this.createDataSource(this.props.users);
      return (
        <View>
  
            <ListView
              enableEmptySections={true}
              renderRow={(item) => this.renderRow(item)}
              dataSource={this.dataSource}
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
});

const mapStateToProps = ({ userFetch }) => {
  const  { users } = userFetch;
  console.log('map to props', users)
  return  { users };
};

export default connect(mapStateToProps, { usersFetch })(UsersScreen);