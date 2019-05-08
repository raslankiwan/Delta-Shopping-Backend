import React from 'react';
import {  
  StyleSheet,
  ListView,
  Text,
  Image,
  AsyncStorage
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Card, CardSection, Button } from '../components/common';
import { wishlistFetch, removeFromWishlist, addToCart } from '../actions';

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
        <CardSection style={{flexDirection: 'column',}}>
          <Text>{Title}</Text>
          <Image
            style={{width: 150, height: 150}}
            source={{uri: product.Image }}
          />
          <Text>Price: {Price} {Currency}</Text>
          <Button onPress={() => {this.props.addToCart(productId, this.state.user)}}>
            Add to Cart
          </Button>
          <Button onPress={() => {this.props.removeFromWishlist(productId, this.state.user)}}>
            Remove
          </Button>
        </CardSection>
    );
  }

  render() {
    this.createDataSource(this.props.products);
    return (
      <Card>
        <CardSection>
          <ListView
            enableEmptySections={true}
            renderRow={(item) => this.renderRow(item)}
            dataSource={this.dataSource}
          />       
        </CardSection>

      </Card>
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

const mapStateToProps = ({ wishlistFetch, removeFromWishlist, addToCart }) => {
  const { products } = wishlistFetch;
  const { removedFromWishlist } = removeFromWishlist;
  const { addedToCart } = addToCart;
  
  return  { products, removedFromWishlist, addedToCart };
};

export default connect(mapStateToProps, { wishlistFetch, removeFromWishlist, addToCart })(WishlistScreen);