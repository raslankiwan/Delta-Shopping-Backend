import React from 'react';
import {
  ListView,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { productFetch, viewItem } from '../actions';
import { Card, CardSection, Button } from '../components/common';

class Category extends React.Component {
 
  state = {
    products: [],
    
  };

  componentWillMount() {
    const { navigation } = this.props;
    const catName = navigation.getParam('CatName','there is no details ');
    //console.log('CatName', catName);
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
      <TouchableHighlight onPress={()=>{this.viewItem(product)}}>
        <CardSection style={{flexDirection: 'column',}}>
          <Text>{Title}</Text>
          <Image
            style={{width: 150, height: 150}}
            source={{uri: product.Image }}
          />
          <Text>Price: {Price} {Currency}</Text>
          <Button onPress={()=>{this.addToCart(productId)}}>
            Add to Cart
          </Button>
        </CardSection>
      </TouchableHighlight>
    );
  }

  viewItem(product) {
   
    this.setState({product: product});
    this.props.navigation.navigate('PDP',{product: product});
  }

  addToCart(productId) {
    const { currentUser } = firebase.auth();
    firebase.database().ref(`/users/${currentUser.uid}/cart`)
    .push({productId});

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

const mapStateToProps = ({ productFetch }) => {
  const  {products, loading} = productFetch;
  
  return  {products, loading};
};

export default connect(mapStateToProps, { productFetch, viewItem })(Category);