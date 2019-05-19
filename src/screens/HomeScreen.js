import React from 'react';
import {
  Text,
  Image,
  TouchableHighlight, 
  View, 
  ScrollView, 
  AsyncStorage
} from 'react-native';
import firebase from 'firebase';
import { Card, SearchBar } from 'react-native-elements';
import Swiper from 'react-native-swiper';
import I18n from '../language/i18n';
import Colors from '../constants/Colors';
import { connect } from 'react-redux';
import { fetchAllProducts } from '../actions';
import { ActivityIndicator } from 'react-native-paper';
// import console = require('console');
import {Permissions, Notifications} from 'expo';
class HomeScreen extends React.Component {
 
  constructor(props){
    super(props)
    this.state = {
      search:'',
      allProducts: [],
      user:firebase.auth().currentUser
    };
   
  }
 
  async componentWillMount() {
    let previousToken = await AsyncStorage.removeItem('pushtoken');
    let user = await AsyncStorage.getItem('userInfo');
    user = JSON.parse(user);
    this.setState({user});

    this.props.fetchAllProducts();
    this.registerForPushNotificationsAsync()
  }
  viewCategory(CatName) {
    this.props.navigation.navigate('Category' ,{CatName});
  }

  updateSearch = search => {
    this.setState({search});
  };
  registerForPushNotificationsAsync = async () => {
    let previousToken = await AsyncStorage.getItem('pushtoken');
    console.log('previousToken',previousToken); 

    if (previousToken != null) {
      return;
    } else {
      console.log('previous Token is null');
        // isNotToken="0";
        // const TokenNotExist=await AsyncStorage.setItem('isToken', isNotToken);
        let {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        console.log(status);
        if (status !== 'granted') {
            console.log('Hey! You might want to enable notifications for my app, they are good.');
            return;
        }
        console.log('continue');
        let token =await Notifications.getExpoPushTokenAsync();
        console.log('token',token);
        // await axios.post(PUSH_ENDPOINT, {token : {token}});
 
        const savedToken = await AsyncStorage.setItem('pushtoken',token);
           // // POST the token to our backend so we can use it to send pushes from there
        var updates = {}
        updates['expoToken'] = token;
        console.log('uid in home', this.state.user.uid)
        await firebase.database().ref(`/users/${this.state.user.uid}`).update({updates})
        // //call the push notification 
    }


 
}
  render() {
    const { search } = this.state;
    const {data, loading, dataCount} = this.props.allProducts
    console.log('data', data)
    if (loading) {
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <ActivityIndicator size='large' />
        </View>
      )
    } else {

      data.sort((a,b) => (a.Rate < b.Rate) ? 1:-1); 
      const sorted=data.slice(0,3)
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
              onEndEditing={()=> { this.props.navigation.navigate('SearchResult', {search, data})}}        
            />
          </View>
          <View style={{justifyContent:'center'}}>
            <Text style={styles.TitleStyle}>{I18n.t('Home.Top')}</Text>
            {/* <Divider style={{backgroundColor:Colors.lightGray, width:'90%', height:1, margin:5}} /> */}
          </View>
          <View style={{height:'30%'}}>
            { data.length > 0 &&
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
            
              {sorted.map( (item) => {
                console.log('item', item)
                return(
                  <TouchableHighlight onPress={()=>this.props.navigation.navigate('PDP' ,{product:item})} key={item.productId}>
                  <Image 
                    source={{uri: item.Image}} 
                    style={{width:'98%',height:'100%', borderRadius:15,margin:2}}
                  />
                </TouchableHighlight>
                )
              })}
              
              </Swiper>
            }
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

const mapStateToProps = ({ allProducts }) => {
  return  {allProducts};
};

export default connect(mapStateToProps, { fetchAllProducts})(HomeScreen);
