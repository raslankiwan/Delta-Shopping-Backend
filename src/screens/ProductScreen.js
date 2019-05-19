import React from 'react';
import { 
    Text, 
    Image, 
    AsyncStorage,
   } from 'react-native';
import {  Button} from 'react-native-elements';
import firebase from 'firebase';
import { Card, CardSection } from '../components/common';
import I18n from '../language/i18n';
import Colors from '../constants/Colors';
import { connect } from 'react-redux';
import { fetchAllProducts } from '../actions';
// import console = require('console');

class ProductScreen extends React.Component {

    state = {
        user: '',
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        user = JSON.parse(user);
        this.setState({user});

        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { Sold } = product;
        this.setState({Sold});
    }

    markSold(productId) {
        firebase.database().ref(productId)
        .update({Sold:true});

        firebase.database().ref(`${productId}/buyers/`)
        .on('value', snapshot => {
            console.log('snap', snapshot);
            snapshot.forEach(child => {
                console.log('child', child.val().id);
                //if (child.val().id === this.state.user.uid) {
                    var now = new Date().getTime();
                    firebase.database().ref('/notification')
                    .push({
                        UserId: child.val().id,
                        //Username: child.val().Username,
                        Title:`${this.state.user.name} sold a product you added to your cart`,
                        productId,
                        ScreenName: 'PDP',
                        createdAt: now
                    });
                //}
            })
        });
    }

    markNotSold(productId) {
        firebase.database().ref(productId)
        .update({Sold:false});

        firebase.database().ref(`${productId}/buyers/`)
        .on('value', snapshot => {
            console.log('snap', snapshot);
            snapshot.forEach(child => {
                console.log('child', child.val().id);
                //if (child.val().id === this.state.user.uid) {
                    var now = new Date().getTime();
                    firebase.database().ref('/notification')
                    .push({
                        UserId: child.val().id,
                        //Username: child.val().Username,
                        Title:`A product in your cart is available again`,
                        productId,
                        ScreenName: 'PDP',
                        createdAt: now
                    });
                //}
            })
        });
    }

    deleteProduct(productId) {

        firebase.database().ref(`${productId}/buyers/`)
        .on('value', snapshot => {
            console.log('snap', snapshot);
            snapshot.forEach(child => {
                // console.log('child', child.val().id);
                // //if (child.val().id === this.state.user.uid) {
                    // var now = new Date().getTime();
                    firebase.database().ref(`/users/${child.val().id}/cart`)
                    .on('value', snap => {
                        snap.forEach(ch =>{
                            if (ch.val().productId === productId) {
                                firebase.database().ref(`/users/${child.val().id}/cart/${ch.key}`)
                                .remove();
                            }
                        })
                        
                    });
                //}
            })
        });

        firebase.database().ref(productId)
        .remove();
      //  this.props.fetchAllProducts();
        this.props.navigation.navigate('Home');
    }

    
    render() {
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { Title, Company, Info, Price, Currency, productId, Viewed, SellerId, SellerName } = product;

        let Sold = product.Sold;

        return (
            <Card>
                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>{Title}</Text>
                </CardSection>

                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>{Company}</Text>
                </CardSection>

                <CardSection>
                    <Image
                        style={{width: 150, height: 150}}
                        source={{uri: product.Image }}
                    />
                </CardSection>
                    
                <CardSection>
                    <Text>{Info}</Text>
                </CardSection>

                <CardSection>
                    <Text>{I18n.t('Category.Price')}: {Price} {Currency}</Text>
                </CardSection>

                <CardSection>
                    {!this.state.Sold &&<Button 
                    title={I18n.t('Product.MarkSold')}
                    onPress={()=>{
                        this.markSold(productId)
                        this.setState({Sold :true})
                    }}
                    buttonStyle={{backgroundColor:Colors.primary, width:'83%'}}
                    />}
                  {this.state.Sold &&<Button 
                    title={I18n.t('Product.MarkNotSold')}
                    onPress={()=>{
                        this.markNotSold(productId)
                        this.setState({Sold : false})
                    }}
                    buttonStyle={{backgroundColor:Colors.secondary, width:'83%'}}
                    />}
                        
                </CardSection>
               
                <CardSection>
                    <Button 
                    title={I18n.t('Product.Delete')}
                    onPress={()=>{this.deleteProduct(productId)}}
                    buttonStyle={{backgroundColor:Colors.secondary, width:'90%'}}
                    />
                </CardSection>

            </Card>    
          
        );
    }
}

const styles = {
    FlatListStyle:{
        borderTopWidth: 0,
        borderBottomWidth: 0,
        // marginBottom:150, 
        flex:1
    }, 
    reviewBtnContainer:{
        borderBottomWidth: 1,
        padding: 5,
        backgroundColor: '#fff',
        justifyContent: 'space-around',
        flexDirection: 'row',
        borderColor: '#ddd',
        position: 'relative'
    }, 
    inputContainerStyle:{
        borderBottomWidth: 0, 
        backgroundColor:'#f1e4e4',
        marginBottom: 5,
        padding:5, 
        
    }, 
};

const mapStateToProps = ({ allProducts }) => {
    return  {allProducts};
};

export default connect(mapStateToProps, {fetchAllProducts})(ProductScreen);