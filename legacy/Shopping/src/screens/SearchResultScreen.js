import React from 'react';
import {
  ListView,
  Text,
  Image,
  AsyncStorage, 
  View
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { viewItem, productFetch } from '../actions';
import {Button, ListItem, Avatar} from 'react-native-elements'
import Colors from '../constants/Colors';
import I18n from '../language/i18n';

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
                  title={I18n.t('Category.ViewProduct')}
                  onPress={()=>{this.viewItem(product)}}
                  buttonStyle={styles.btnStyle}
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
    this.createDataSource(this.state.searchResult);
    return (
      <View style={{flex:1}}>
        <ListView
          enableEmptySections={true} 
          renderRow={(item) => this.renderRow(item)}
          dataSource={this.dataSource}
        />       
      </View>
    );
  }

}

const mapStateToProps = ({ product, viewItem }) => {

  return  {product};
};

const styles={
  productContainer:{
    flexDirection:'row', 
    width:'90%',
    padding:5, 
    backgroundColor:'white', 
    shadowColor: '#e5e6e8',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 6, 
    elevation:5, 
    margin:8, 
    borderColor:'#e5e6e8', 
    borderWidth:1, 
    borderRadius:5, 
  } ,
  btnWrapper:{
    flexDirection:'row', 
    justifyContent:'space-around', 
    marginTop:5
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
    width:70, 
    padding:5, 
  }

};

export default connect(mapStateToProps, { viewItem, productFetch })(SearchResultScreen);