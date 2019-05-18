import React from 'react';
import {  
  StyleSheet,
  ListView,
  View,
  Text,
  Image,
  AsyncStorage
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import I18n from '../language/i18n';
import {Button, Icon, ListItem, Avatar} from 'react-native-elements'
import { cartFetch, removeFromCart } from '../actions';
import Colors  from '../constants/Colors';
class CartScreen extends React.Component {
  
  
  state = {
    cartProducts: []
  };
  
 async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});
    this.props.cartFetch(user);

    this.findTotal(this.props.cartProducts);
  }

  findTotal(products) {
    let total=0;
    products.map((item)=>{
      let curr = parseInt(item.Price);
      total += curr;
    });
    return total;
  }

  createDataSource( _data ) {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      });
    this.dataSource = ds.cloneWithRows(_data);
  }
   

  renderRow(product) {
    const { Title, Price, Currency, productId, SellerId } = product;
    return(   
      <ListItem
          key={productId}
          title={Title}
          titleStyle={styles.titleStyle}
          subtitle={
            <Text style={styles.priceStyle}>{I18n.t('Category.Price')}: {Price} {Currency}</Text>
          }
          rightElement={
            <View>
              <Button
                raised
                title={I18n.t('Category.removeFromCart')}
                onPress={()=>{this.props.removeFromCart(productId, this.state.user)}} 
                buttonStyle={styles.btnStyle}
                containerStyle={{marginVertical:10}}
              />
              <Button
                raised
                title={I18n.t('Cart.Seller')}
                onPress={()=>this.props.navigation.navigate('Chat', {dstUserId:SellerId})} 
                buttonStyle={styles.btnStyle}
                containerStyle={{marginVertical:10}}
              />
            </View>
          }
          leftAvatar={
            <Avatar
              size='large'
              source={{uri: product.Image }}
              overlayContainerStyle={styles.AvatarStyle}
            />
          }
          containerStyle={styles.ListItemStyle}
          
      />
      
    );
  }

  renderFooter (){
    return(
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>{I18n.t('Cart.Total')}: { this.findTotal(this.props.cartProducts) } </Text>
        
      </View>
    );
    <Button
          title='Proceed to checkout'
          buttonStyle={styles.footerBtn}
         />
  }

  render() {
    this.createDataSource(this.props.cartProducts);
    return (
      <View>
          <ListView
            enableEmptySections={true}
            renderRow={(item) => this.renderRow(item)}
            dataSource={this.dataSource}
            renderFooter={()=>this.renderFooter()}
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
  btnStyle:{
    backgroundColor:Colors.primary
  }, 
  ListItemStyle:{
    borderBottomColor:Colors.lightGray, 
    borderBottomWidth:1, 
    padding:5, 
    alignItems:'flex-start'
  }, 
  AvatarStyle:{
    borderColor:Colors.primary, 
    borderWidth:2, 
    borderRadius:5
  }, 
  footerContainer:{
    marginTop:10, 
    flexDirection:'column', 
    justifyContent:'center', 
    alignItems:'center'
  }, 
  footerText:{
    color:Colors.primary, 
    fontSize:18, 
    fontWeight:'700'
  }, 
  footerBtn:{
    backgroundColor:Colors.secondary, 
    width:'50%', 
    marginTop:8, 
  }, 
  priceStyle:{
    fontSize:16, 
    color:'#a0a0a0', 
    fontWeight:'400', 
    marginTop:7,
  }, 
  titleStyle:{
    fontSize:18, 
    fontWeight:'500', 
    color:Colors.primary
  }
});

const mapStateToProps = ({ cartFetch, removeFromCart }) => {
  const  { cartProducts } = cartFetch;
  const { removedFromCart } = removeFromCart;

  return  { cartProducts, removedFromCart };
};

export default connect(mapStateToProps, { cartFetch, removeFromCart })(CartScreen);