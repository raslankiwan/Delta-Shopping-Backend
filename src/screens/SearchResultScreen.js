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
import { viewItem, addToCart } from '../actions';
import { Card, CardSection, Button } from '../components/common';

class SearchResultScreen extends React.Component {
 
  state = {
    searchResult:[],
    allProducts: [],
    user:''
  };

  async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    this.setState({user});
    const { navigation } = this.props;
    const search = navigation.getParam('search','there is no details ');
    const allProducts = navigation.getParam('data','there is no details ');
    
    this.setState({allProducts});
    this.performSearch(search)
  }

  performSearch(search) {
    const newData = this.state.allProducts.filter(item => {    
        const itemData = `${String(item.Title).toUpperCase()}   
        ${String(item.Company).toUpperCase()} ${String(item.Info).toUpperCase()}`;
        const textData = search.toUpperCase();
        return itemData.indexOf(textData) > -1;
         
    });    
    this.setState({ searchResult: newData }); 
      
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
    this.createDataSource(this.state.searchResult);
    //console.log('in render',this.props.allProducts)
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

const mapStateToProps = ({ addToCart, viewItem }) => {
  const { addedToCart } = addToCart;

  return  {addedToCart};
};

export default connect(mapStateToProps, { viewItem, addToCart })(SearchResultScreen);