import React from 'react';
import {View, Text , ScrollView, TouchableHighlight, AsyncStorage} from 'react-native';
import {Icon, Avatar} from 'react-native-elements';
import Colors from '../constants/Colors'
import I18n from '../language/i18n';
import { connect } from 'react-redux';
import { fetchAllProducts } from '../actions';
import { ActivityIndicator } from 'react-native-paper';

class SellScreen extends React.Component {

    state={
        allProducts: [],
        myProducts: [], 
        user:''
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        
        user= JSON.parse(user);
        this.setState({user});
        let myProducts = [];
        const {data} = this.props.allProducts;
        data.map((item)=>{
            if(item.SellerId === this.state.user.uid ) {
                myProducts.push(item);
            }
        });
        this.setState({myProducts});
    }

    render() {
        const {data, loading, dataCount} = this.props.allProducts

        if (loading) {
          return (
            <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                <ActivityIndicator size='large' />
            </View>
          )
        } else {
                
            return(
                <View style={styles.mainContainer}>
                    <View style={styles.topContainer}>
                        <Icon
                            type='material-community'
                            name='plus-circle'
                            size={35}
                            color={Colors.primary}
                            style={styles.IconStyle}
                            onPress={()=>{this.props.navigation.navigate('SellForm')}}
                        />
                        <Text style={styles.AddTitle}>
                            {I18n.t('SellScreen.add')}
                        </Text>
                    </View>
                    <ScrollView>
                        <View style={styles.productsContainer}>
                            {
                                this.state.myProducts.map((item)=>{
                                    return(
                                        <TouchableHighlight 
                                            key={item.productId} 
                                            style={styles.AvatarContainer} 
                                            onPress={()=> { this.props.navigation.navigate('Product' ,{product: item}); }}
                                        >
                                            <View>
                                                <Avatar
                                                    rounded
                                                    size='xlarge'
                                                    source={{uri:item.Image}}
                                                    
                                                />
                                                <Text style={styles.productTitle}>{item.Title}</Text>
                                            </View>
                                        </TouchableHighlight>
                                    )
                                })
                            }
                        </View>

                    </ScrollView>
                </View>
            );
        }
    }
}
const styles={
    mainContainer:{
        backgroundColor:'white'
    },
    topContainer:{
        flexDirection:'row', 
        justifyContent:'flex-start', 
        padding:5,
        height:'20%' 
    }, 
    AddTitle:{
        color:Colors.primary, 
        fontSize:20, 
        fontWeight:'500', 
        margin:5
    }, 
    IconStyle:{
        margin:5
    }, 
    productsContainer:{
        flexDirection:'row', 
        justifyContent:'center', 
        height:'80%', 
        flexWrap:'wrap'
    },
    AvatarContainer:{
        width:'44%', 
        justifyContent:'center', 
        alignItems:'center', 
        padding:6, 
        backgroundColor:Colors.primary, 
        margin:8
    }, 
    productTitle:{
        fontSize:18, 
        fontWeight:'400', 
        color:Colors.secondary
    }
}

const mapStateToProps = ({ allProducts }) => {
    return  {allProducts};
};

export default connect(mapStateToProps, { fetchAllProducts })(SellScreen);