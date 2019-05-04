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
import { cartFetch, removeFromCart } from '../actions';

class CartScreen extends React.Component {
  
  
  state = {
    products: []
  };
  
 async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});
    this.props.cartFetch(user);

    this.findTotal(this.props.products);
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
    const { Title, Price, Currency, productId } = product;

    return(
        <CardSection style={{flexDirection: 'column',}}>
          <Text>{Title}</Text>
          <Image
            style={{width: 150, height: 150}}
            source={{uri: product.Image }}
          />
          <Text>Price: {Price} {Currency}</Text>
          <Button onPress={() => {this.props.removeFromCart(productId, this.state.user)}}>
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

        <CardSection style={{flexDirection: 'column',}}>
          <Text>Cart subtotal: { this.findTotal(this.props.products) } </Text>
          <Button> Proceed to checkout</Button>
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

const mapStateToProps = ({ cartFetch, removeFromCart }) => {
  const  { products } = cartFetch;
  const { removedFromCart } = removeFromCart;

  return  { products, removedFromCart };
};

export default connect(mapStateToProps, { cartFetch, removeFromCart })(CartScreen);