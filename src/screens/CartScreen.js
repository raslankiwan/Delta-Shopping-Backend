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
import {Button, Icon, Card} from 'react-native-elements'
import { cartFetch, removeFromCart } from '../actions';
import { CardSection } from '../components/common';
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
   
  // renderRow(product) {
  //   const { Title, Price, Currency, productId } = product;

  //   return(
  //       <CardSection style={{flexDirection: 'column',}}>
  //         <Text>{Title}</Text>
  //         <Image
  //           style={{width: 150, height: 150}}
  //           source={{uri: product.Image }}
  //         />
  //         <Text>Price: {Price} {Currency}</Text>
  //         <Button onPress={() => {this.props.removeFromCart(productId, this.state.user)}}>
  //           Remove
  //         </Button>
  //       </CardSection>
  //   );
  // }

  renderRow(product) {
    const { Title, Price, Currency, productId } = product;
    return(   
      <View style={styles.productContainer} id={productId}>
       
          <View style={styles.imageWrapper}>
              <Image
                  style={{width: '100%', height: 100}}
                  source={{uri: product.Image }}
                />
          </View>

        <View style={styles.descWrapper}>
            <Text style={styles.titleStyle}>{Title}</Text>
            <Text style={styles.priceStyle}>{I18n.t('Category.Price')}: {Price} {Currency}</Text>
            <View style={styles.btnWrapper}>
                <Button 
                raised
                title={I18n.t('Category.removeFromCart')}
                onPress={()=>{this.props.removeFromCart(productId, this.state.user)}}  
                buttonStyle={styles.btnStyle}
                icon={
                  <Icon
                    type
                   />
                }
                />
            </View>
        </View>

      
         
      </View>
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