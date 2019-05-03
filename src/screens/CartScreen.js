import React from 'react';
import {  
  StyleSheet,
  ListView,
  Text,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Card, CardSection, Button } from '../components/common';
import { cartFetch } from '../actions';

class CartScreen extends React.Component {
  
  
  state = {
    products: [],
    total: ''
  };
  
  componentWillMount() {
    this.props.cartFetch();

    this.findTotal(this.props.products);
  }

  findTotal(products) {
    let total=0;
    products.map((item)=>{
      let curr = parseInt(item.Price);
      total += curr;
    });
    console.log('total', total);
    this.setState({total});
  }

  createDataSource( _data ) {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      });
    this.dataSource = ds.cloneWithRows(_data);
  }
   
  renderRow(product) {
    const { Title, Price, Currency } = product;
   

    return(   
     
        <CardSection style={{flexDirection: 'column',}}>
          <Text>{Title}</Text>
          <Image
            style={{width: 150, height: 150}}
            source={{uri: product.Image }}
          />
          <Text>Price: {Price} {Currency}</Text>
          
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
          <Text>Cart subtotal: { this.state.total } </Text>
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


const mapStateToProps = ({ cartFetch }) => {
  const  { products } = cartFetch;
  //console.log('map:',products);
  return  { products };
};

export default connect(mapStateToProps, { cartFetch })(CartScreen);