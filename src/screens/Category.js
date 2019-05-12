import React from 'react';
import {
  ListView,
  Text,
  Image,
  TouchableHighlight, 
  AsyncStorage, 
  View
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { productFetch, viewItem, addToCart } from '../actions';
import {Button, Icon} from 'react-native-elements'
import I18n from '../language/i18n';
import Colors from '../constants/Colors'
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
      <View style={styles.productContainer} id={productId}>
       
          <View style={styles.imageWrapper}>
              <Image
                  style={{width: '100%', height: 100}}
                  source={{uri: product.Image }}
                />
          </View>

        <View style={styles.descWrapper}>
            <Text style={styles.titleStyle}>{Title}</Text>
            <Text style={styles.priceStyle}>Price: {Price} {Currency}</Text>
            <View style={styles.btnWrapper}>
                <Button
                raised
                title={I18n.t('Category.ViewProduct')}
                onPress={()=>{this.viewItem(product)}}
                buttonStyle={styles.btnStyle}
                />
                <Button 
                raised
                title={I18n.t('Category.addToCart')}
                onPress={()=>{this.props.addToCart(productId, this.state.user)}}  
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

  viewItem(product) {
    this.setState({product: product});

    this.props.navigation.navigate('PDP',{product: product});
  }

  render() {
    this.createDataSource(this.props.products);
    return (
      <View>
          <ListView
            enableEmptySections={true} 
            renderRow={(item) => this.renderRow(item)}
            dataSource={this.dataSource}
          />       
      </View>
    );
  }

}

const mapStateToProps = ({ productFetch, addToCart }) => {
  const  {products, loading} = productFetch;
  const { addedToCart } = addToCart;

  return  {products, loading, addedToCart};
};
const styles={
  productContainer:{
    flexDirection:'row', 
    width:'100%',
    padding:5, 
    marginTop:8, 
    backgroundColor:'white', 
    // justifyContent:'space-evenly', 

  } ,
  btnWrapper:{
    flexDirection:'row', 
    justifyContent:'space-around'
  }, 
  imageWrapper:{
    width:'30%', 
    margin:5, 
  }, 
  descWrapper:{
    width:'60%', 
    margin:5
  }, 
  titleStyle:{
    color:Colors.primary, 
    fontSize:20, 
    fontWeight:'600'
  },
  priceStyle:{
    color:Colors.secondary, 
    fontSize:20, 
    fontWeight:'400'
  }, 
  btnStyle:{
    backgroundColor:Colors.primary, 
    width:100, 
    padding:5, 
    marginTop:5,
  }

}
export default connect(mapStateToProps, { productFetch, viewItem, addToCart })(Category);