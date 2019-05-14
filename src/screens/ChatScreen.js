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
import { productFetch, viewItem, addToCart } from '../actions';
import {Button, Icon} from 'react-native-elements'
import I18n from '../language/i18n';
import Colors from '../constants/Colors'

class ChatScreen extends React.Component {
 
  state = {
    products: [],
    user:''
  };

  async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});
    const { navigation } = this.props;
    const dstUser = navigation.getParam('dstUser','there is no details ');
    console.log('dstUser, char screen', dstUser);
    this.setState({dstUser});
  }



  render() {
    const { navigation } = this.props;
    const dstUser = navigation.getParam('dstUser','there is no details ');
    console.log('dstUser, char screen', dstUser);
    return (
      <View style={{flex:1}}>
         <Text>{dstUser.Name}</Text>
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