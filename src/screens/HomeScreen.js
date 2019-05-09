import React from 'react';
import {
  Text,
  Image,
  TouchableHighlight, 
  View, 
  ScrollView
} from 'react-native';
import { Card, Input, Button, SearchBar } from 'react-native-elements';
import COLOR from '../constants/Colors';

class HomeScreen extends React.Component {
 
  state = {
    search:''
  };

  viewCategory(CatName) {
    this.props.navigation.navigate('Category' ,{CatName});
  }

  updateSearch = search => {
    this.setState({search});
  };

  render() {
    const { search } = this.state;
    return(
      <ScrollView>
        <View>
          <SearchBar
            placeholder="Search product"        
            lightTheme        
            round        
            onChangeText={ this.updateSearch }
            value={search}
            autoCorrect={false} 
            onEndEditing={()=> { this.props.navigation.navigate('SearchResult', {search})}}        
          />
        </View>
        <View style={styles.Wrapper}>
          <TouchableHighlight underlayColor={COLOR.lightGray} onPress={()=>{this.viewCategory('/categories/mobiles')}} style={{margin:5, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}>
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat1.jpg')}
                style={{width:'100%'}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:COLOR.primary}}>Mobiles</Text>
            </Card>
          </TouchableHighlight>

          <TouchableHighlight underlayColor={COLOR.lightGray} onPress={()=>{this.viewCategory('/categories/laptops')}} style={{margin:5, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}> 
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat2.jpg')}
                style={{width:'100%'}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:COLOR.primary}}>Laptops</Text>
            </Card>
          </TouchableHighlight>

          <TouchableHighlight underlayColor={COLOR.lightGray} onPress={()=>{this.viewCategory('/categories/Music')}} style={{margin:5, width:'45%',}}>
            <Card containerStyle={styles.CardStyle}>
                <Image 
                resizeMode="cover"
                source={require('../assets/images/cat3.jpg')}
                style={{width:'100%'}}
                />
                <Text style={{fontSize:20, fontWeight:'700', color:COLOR.primary}}>Music</Text>
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
    width:'100%'  
  },
  btnStyle:{
    backgroundColor:COLOR.secondary,
    width:'100%',
    borderRadius:10,
    borderColor:COLOR.secondary,
    borderWidth:1 
  }, 
  btnText:{
    textAlign:'center', 
    fontSize:20, 
    fontWeight:'500', 
    color:'#f1e4e4'
  }, 
}

export default HomeScreen;