import React from 'react';
import {  
  StyleSheet,
  ListView,
  Text,
  Image,
  AsyncStorage, 
  View
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import {Button, ListItem , Avatar} from 'react-native-elements'
import { wishlistFetch, removeFromWishlist, addToCart } from '../actions';
import I18n from '../language/i18n';
import Colors  from '../constants/Colors';
class WishlistScreen extends React.Component {
  
  
  state = {
    products: []
  };
  
 async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});

    this.props.wishlistFetch(user);
  }

  createDataSource( _data ) {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      });
    this.dataSource = ds.cloneWithRows(_data);
  }
   
  renderRow(product) {
    const { Title, Price, Currency, productId } = product;

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
            title='Add to Cart'
            titleStyle={styles.btnTitle}
            onPress={() => {this.props.addToCart(productId, this.state.user)}}
            buttonStyle={styles.btnStyle}
            containerStyle={{marginBottom:5,}}
            />
            <Button
            raised
            title='Remove'
            titleStyle={styles.btnTitle}
            onPress={() => {this.props.removeFromWishlist(productId, this.state.user)}}
            buttonStyle={styles.removeBtnStyle}
            containerStyle={{marginBottom:5}}
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

  render() {
    this.createDataSource(this.props.products);
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
  btnStyle:{
    backgroundColor:Colors.primary,
    borderWidth:1, 
    borderRadius:10, 
    padding:5,
    borderColor:Colors.primary
  }, 
  removeBtnStyle:{
    backgroundColor:Colors.secondary,
    borderWidth:1, 
    borderRadius:10, 
    padding:5,
    borderColor:Colors.secondary
  }, 
  ListItemStyle:{
    borderBottomColor:Colors.lightGray, 
    borderBottomWidth:1, 
    padding:5, 
  }, 
  AvatarStyle:{
    borderColor:Colors.primary, 
    borderWidth:2, 
    borderRadius:5
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
  }, 
  btnTitle:{
    fontSize:14, 
    fontWeight:'500'
  }
});

const mapStateToProps = ({ wishlistFetch, removeFromWishlist, addToCart }) => {
  const { products } = wishlistFetch;
  const { removedFromWishlist } = removeFromWishlist;
  const { addedToCart } = addToCart;
  
  return  { products, removedFromWishlist, addedToCart };
};

export default connect(mapStateToProps, { wishlistFetch, removeFromWishlist, addToCart })(WishlistScreen);