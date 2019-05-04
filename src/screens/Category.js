import React from 'react';
import {
  ListView,
  Text,
  Image,
  TouchableHighlight, 
  AsyncStorage
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { productFetch, viewItem, addToCart } from '../actions';
import { Card, CardSection, Button } from '../components/common';

class Category extends React.Component {
 
  state = {
    products: [],
    user:''
  };

  async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});
    const { navigation } = this.props;
    const catName = navigation.getParam('CatName','there is no details ');

    this.props.productFetch(catName);
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
        <TouchableHighlight onPress={()=>{this.viewItem(product)}}>
          <CardSection>
            <Text>{Title}</Text>
            <Image
              style={{width: 150, height: 150}}
              source={{uri: product.Image }}
            />
            <Text>Price: {Price} {Currency}</Text>
          </CardSection>
        </TouchableHighlight>

        <Button onPress={()=>{this.props.addToCart(productId, this.state.user)}}>
          Add to Cart
        </Button>
      </CardSection>
    );
  }

  viewItem(product) {
    this.setState({product: product});

    this.props.navigation.navigate('PDP',{product: product});
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

const mapStateToProps = ({ productFetch, addToCart }) => {
  const  {products, loading} = productFetch;
  const { addedToCart } = addToCart;

  return  {products, loading, addedToCart};
};

export default connect(mapStateToProps, { productFetch, viewItem, addToCart })(Category);