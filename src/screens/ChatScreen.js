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
import firebase from 'firebase';
import { connect } from 'react-redux';
import { productFetch, viewItem, addToCart } from '../actions';
import {Button, Icon} from 'react-native-elements'
import I18n from '../language/i18n';
import Colors from '../constants/Colors'
import { GiftedChat } from 'react-native-gifted-chat';
import KeyboardSpacer from 'react-native-keyboard-spacer';

class ChatScreen extends React.Component {
 

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      name:'', 
      uid:'', 
      email:'',
      token:''
    };
    this.user = firebase.auth().currentUser;

    user = this.user;
    console.log('user from firebase', user)
    const { navigation } = this.props;
    const info = navigation.getParam('dstUser','there is no chat ');
    console.log('user from Users page', info)
    uid = info.userId;

    this.chatRef = this.getRef().child('chat/' + this.generateChatId());
    // this.notificationRef = this.getRef().child('notification/' + uid);
    this.chatRefData = this.chatRef.orderByChild('order');
    this.onSend = this.onSend.bind(this);
  }
  generateChatId() {
    if (this.user.uid > uid) return `${this.user.uid}-${uid}`;
    else return `${uid}-${this.user.uid}`;
  }

  getRef() {
    return firebase.database().ref();
  }
 
  async componentWillMount(){
 
    this.listenForItems(this.chatRefData);
    // const { navigation } = this.props;
    // const info = navigation.getParam('post','there is no chat ');
    // navigation.setParams({ headerChatTitle: info.name });
    // let user = await AsyncStorage.getItem('userInfo');
    // this.setState({user});

  
  } 
  componentWillUnmount() {
    this.chatRefData.off();
  }


  listenForItems(chatRef) {
    chatRef.on('value', snap => {
      // get children as an array
      var items = [];
      snap.forEach(child => {
        items.push({
          _id: child.val().createdAt,
          text: child.val().text,
          createdAt: new Date(child.val().createdAt),
          user: {
            _id: child.val().uid,
          },
        });
      });
      console.log('items', items);
      this.setState({
        loading: false,
        messages: items,
      });
    });
  }
  onSend(messages = []) {
    const component=this;
    messages.forEach(message => {
      var now = new Date().getTime();
      this.chatRef.push({
        _id: now,
        text: message.text,
        createdAt: now,
        uid: user.uid,
        fuid: uid,
        order: -1 * now,
      },function (result) {
          // console.log('result of push chat', result);
          // component.notifyRecipient(message.text)
      });
    });
  }

  render() {
    const { navigation } = this.props;
    const dstUser = navigation.getParam('dstUser','there is no details ');
    console.log('dstUser, char screen', dstUser);
    return (
      <View style={{flex: 1}}>
        <GiftedChat
              messages={this.state.messages}
              onSend={this.onSend.bind(this)}
              user={{
                _id: this.user.uid,
              }}
              scrollToBottom={true}
              alwaysShowSend={true}
              loadEarlier={true}
            />
      <KeyboardSpacer />
    </View>
    );
  }

}

const mapStateToProps = ({ productFetch, addToCart }) => {
  const  {products, loading} = productFetch;
  const { addedToCart } = addToCart;

  return  {products, loading, addedToCart};
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

export default ChatScreen;
// export default connect(mapStateToProps, { productFetch, viewItem, addToCart })(ChatScreen);