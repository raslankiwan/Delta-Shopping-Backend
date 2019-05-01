import React from 'react';
import {
  ListView,
  Text,
  Image,
  TouchableHighlight, 
  View, 
  ScrollView
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { productFetch, viewItem } from '../actions';
import {  CardSection, Button } from '../components/common';
import {Card, Avatar} from 'react-native-elements';
import Colors from '../constants/Colors';

class HomeScreen extends React.Component {
 
  state = {
    products: [],
    
  };

  componentWillMount() {
    this.props.productFetch('/categories/electronics/mobiles');
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

  viewElectronics() {
    this.props.navigation.navigate('Electronics');
  }


  render() {
    return(
      <ScrollView>
        <View style={styles.Wrapper}>
          <TouchableHighlight underlayColor={Colors.lightGray} onPress={()=>{this.viewElectronics()}} style={{margin:5, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}>
              
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat1.jpg')}
                style={{width:'100%'}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:Colors.primary}}>Electronics</Text>
            
            </Card>
          </TouchableHighlight>
        </View>
      </ScrollView>
    );
  }
}


const mapStateToProps = ({ productFetch }) => {
  const  {products, loading} = productFetch;
  
  return  {products, loading};
};
const styles={
  Wrapper:{
    flexDirection:'row', 
    flexWrap:'wrap',
     width:'100%'
  },
  CardStyle:{
    shadowColor: '#e5e6e8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 6, 
    elevation:5, 
    width:'100%'
    
  }
}

export default connect(mapStateToProps, { productFetch, viewItem })(HomeScreen);