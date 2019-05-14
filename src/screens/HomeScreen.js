import React from 'react';
import {
  Text,
  Image,
  TouchableHighlight, 
  View, 
  ScrollView, 
  AsyncStorage
} from 'react-native';
import { Card, Input, Button, SearchBar , Divider} from 'react-native-elements';
import Swiper from 'react-native-swiper';
import I18n from '../language/i18n';
import Colors from '../constants/Colors';
class HomeScreen extends React.Component {
 
  state = {
    search:''
  };

  async componentWillMount() {
    let user = await AsyncStorage.getItem('userInfo');
    console.log('user Info', user)
  }
  viewCategory(CatName) {
    this.props.navigation.navigate('Category' ,{CatName});
  }

  updateSearch = search => {
    this.setState({search});
  };

  render() {
    const { search } = this.state;
    return(
      <ScrollView contentContainerStyle={{paddingBottom:200}}>
      
        <View>
          <SearchBar
            placeholder={I18n.t('Home.Search')}        
            lightTheme        
            round        
            onChangeText={ this.updateSearch }
            value={search}
            autoCorrect={false} 
            onEndEditing={()=> { this.props.navigation.navigate('SearchResult', {search})}}        
          />
        </View>
        <View style={{height:'30%'}}>
          <Swiper 
            autoplay={true} 
            style={{ height:'100%',padding:5}} 
            containerStyle={{  width:'100%',height:'100%', padding:5}} 
            // showsButtons={true} 
            showsPagination={true} 
            activeDotColor='white'
            // nextButton={<Text style={styles.buttonText}>{I18nManager.isRTL ?'‹':'›'}</Text>} 
            // prevButton={<Text style={styles.buttonText}>{I18nManager.isRTL ?'›':'‹'}</Text>} 
            > 
            
              <Image 
              source={require('../assets/images/sale2.png')} 
              style={{width:'98%',height:'100%', borderRadius:15,margin:2}}
              />
              <Image 
              source={require('../assets/images/sale1.png')} 
              style={{width:'98%', height:'100%',borderRadius:15,margin:2}}
              />
                <Image 
              source={require('../assets/images/sale3.png')} 
              style={{width:'98%', height:'100%',borderRadius:15,margin:2}}
              />
            </Swiper>
        </View>
        <View style={{justifyContent:'center'}}>
          <Text style={styles.TitleStyle}>{I18n.t('Home.Categories')}</Text>
          {/* <Divider style={{backgroundColor:Colors.lightGray, width:'90%', height:1, margin:5}} /> */}
         </View>
        <View style={styles.Wrapper}>
    
          <TouchableHighlight underlayColor={Colors.lightGray} onPress={()=>{this.viewCategory('/categories/mobiles')}} style={{margin:3, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}>
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat6.jpg')}
                style={{width:'100%', height:150}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:Colors.primary}}>{I18n.t('Home.Mobiles')}</Text>
            </Card>
          </TouchableHighlight>

          <TouchableHighlight underlayColor={Colors.lightGray} onPress={()=>{this.viewCategory('/categories/laptops')}} style={{margin:3, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}> 
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat7.jpg')}
                style={{width:'100%', height:150}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:Colors.primary}}>{I18n.t('Home.Laptops')}</Text>
            </Card>
          </TouchableHighlight>

          <TouchableHighlight underlayColor={Colors.lightGray} onPress={()=>{this.viewCategory('/categories/Music')}} style={{margin:3, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}>
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat3.jpg')}
                style={{width:'100%', height:150}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:Colors.primary}}>{I18n.t('Home.Music')}</Text>
            </Card>
          </TouchableHighlight>
          <TouchableHighlight underlayColor={Colors.lightGray}  style={{margin:3, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}>
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat2.jpg')}
                style={{width:'100%', height:150}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:Colors.primary}}>{I18n.t('Home.Cars')}</Text>
            </Card>
          </TouchableHighlight>
        </View>
      </ScrollView>
    );
  }
}

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
    width:'100%'  , 
    padding:7
  },
  btnStyle:{
    backgroundColor:Colors.secondary,
    width:'100%',
    borderRadius:10,
    borderColor:Colors.secondary,
    borderWidth:1 
  }, 
  btnText:{
    textAlign:'center', 
    fontSize:20, 
    fontWeight:'500', 
    color:'#f1e4e4'
  }, 
  TitleStyle:{
    color:Colors.primary, 
    fontSize:20, 
    fontWeight:'600', 
    margin:10, 
    textAlign:'center'
  }
}

export default HomeScreen;