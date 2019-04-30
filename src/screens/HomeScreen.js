import React from 'react';
import {
  ListView,
  Text,
  Image,
  TouchableHighlight
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { productFetch, viewItem } from '../actions';
import { Card, CardSection, Button } from '../components/common';

class HomeScreen extends React.Component {
 
  state = {
    products: [],
    
  };
  componentWillMount() {
    this.props.productFetch();
    
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
      <TouchableHighlight onPress={()=>{this.viewItem(product)}}>
        <CardSection style={{flexDirection: 'column',}}>
          <Text>{Title}</Text>
          <Image
            style={{width: 150, height: 150}}
            source={{uri: product.Image }}
          />
          <Text>Price: {Price} {Currency}</Text>
          <Button onPress={()=>{this.viewItem(product)}}>
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




  render() {
    this.createDataSource(this.props.products);
    return (
      <Card>
        {/* <CardSection>
          <Header headerText="Home"></Header>
        </CardSection> */}

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

export default connect(mapStateToProps, { productFetch, viewItem })(HomeScreen);