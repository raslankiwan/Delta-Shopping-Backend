import React from 'react';
import {
  ListView,
  Text,
  AsyncStorage, 
  View
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { viewItem, addToCart } from '../actions';
import {Button, ListItem, Avatar} from 'react-native-elements'
import Colors from '../constants/Colors'
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
      <ListItem
      key={productId}
      title={Title}
      subtitle={<Text>Price: {Price} {Currency}</Text>}
      rightElement={
        <View>
            <Button
            raised
            title='Add to Cart'
            titleStyle={styles.btnTitle}
            onPress={()=>{this.props.addToCart(productId, this.state.user)}}
            buttonStyle={styles.btnStyle}
            containerStyle={{marginBottom:5,}}
            />
         </View>
      }
      leftAvatar={
        <Avatar
        size='large'
        source={{uri: product.Image }}
        overlayContainerStyle={styles.AvatarStyle}
        />
      }
      containerStyle={styles.ListItemStyle}
      onPress={()=>{this.viewItem(product)}}
      />

    );
  }

  viewItem(product) {
    this.setState({product: product});

    this.props.navigation.navigate('PDP',{product: product});
  }

  render() {
    this.createDataSource(this.state.searchResult);
    return (
        <View>
            <ListView
                enableEmptySections={true} 
                renderRow={(item) => this.renderRow(item)}
                dataSource={this.dataSource}
                contentContainerStyle={{marginTop:8}}
            />       
        </View>
    );
  }

}

const mapStateToProps = ({ addToCart, viewItem }) => {
  const { addedToCart } = addToCart;

  return  {addedToCart};
};
const styles={
  btnStyle:{
    backgroundColor:Colors.primary,
    borderWidth:1, 
    borderRadius:10, 
    padding:5,
    borderColor:Colors.primary
  }, 
  removeBtnStyle:{
    backgroundColor:Colors.secondary,
    borderWidth:1, 
    borderRadius:10, 
    padding:5,
    borderColor:Colors.secondary
  }, 
  ListItemStyle:{
    borderBottomColor:Colors.lightGray, 
    borderBottomWidth:1, 
    padding:5, 
  }, 
  AvatarStyle:{
    borderColor:Colors.primary, 
    borderWidth:2, 
    borderRadius:5
  }, 
  priceStyle:{
    fontSize:16, 
    color:'#a0a0a0', 
    fontWeight:'400', 
    marginTop:7,
  }, 
  titleStyle:{
    fontSize:18, 
    fontWeight:'500', 
    color:Colors.primary
  }, 
  btnTitle:{
    fontSize:14, 
    fontWeight:'500'
  }
}
export default connect(mapStateToProps, { viewItem, addToCart })(SearchResultScreen);