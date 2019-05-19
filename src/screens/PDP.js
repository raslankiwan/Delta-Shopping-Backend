import React from 'react';
import { 
    Text, 
    Image, 
    AsyncStorage,
    FlatList, View} from 'react-native';
import { connect } from 'react-redux';
import StarRating from 'react-native-star-rating';
import { Input, Avatar , Button, ListItem} from 'react-native-elements';
import firebase from 'firebase';
import { Card, CardSection } from '../components/common';
import I18n from '../language/i18n';
import { addToCart, addToWishlist, incrementViews, reviewChanged, addReview, reviewFetch } from '../actions';
import Colors from '../constants/Colors'
// import console = require('console');

var data=[];
class PDP extends React.Component {

    state = {
        user: '',
        review: '',
        reviews:[], 
        Viewed:'',
        product: null
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        uu = JSON.parse(user);
        this.setState({user, uid:uu.uid, uu});
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { productId, Viewed } = product;
        
        this.setState({Viewed, productId, product});
        this.setState({starCount: product.Rate})
        this.incrementViews(productId);
        this.props.reviewFetch(productId);
    }


    incrementViews =(productId) => {
        let incremented=parseInt(this.state.Viewed)+1;
        firebase.database().ref(productId).update({Viewed: incremented})
    }

    onStarRatingPress(rating) {
        const uu= JSON.parse(this.state.user);

        this.setState({
          starCount: rating
        });
        firebase.database().ref(`${this.state.productId}/rating/${uu.uid}`)
        .update({rating});
        
        let Rate = 0.0;
        let count = 0;
        firebase.database().ref(`${this.state.productId}/rating/`)
        .on('value', snapshot => {
            snapshot.forEach(child => {
                Rate += parseFloat(child.val().rating);
                count++;
            });
            Rate /= count;
            firebase.database().ref(`${this.state.productId}/`)
            .update({Rate});
        });
    }

    renderRow(item) {
        const { review, userId, username } = item.item;
        return(   
           <ListItem
                leftAvatar={
                    <Avatar 
                        rounded
                        size='small'
                        title='A'
                    />
                }
                title={username}
                subtitle={review}
                key={userId}
                containerStyle={{borderBottomColor:'#ddd', borderBottomWidth:1}}
           />
        );
    }
    
    onReviewChanged(text) {
        this.setState({review:text});
    }

    clearReview() {
        this.setState({review:''});
    }

    checkIfSold(Sold) {
        if (Sold) {
            return (
                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>This Product is sold</Text>
                </CardSection>
            );
        } else {
            return (
                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>This Product is not sold</Text>
                </CardSection>
            );
        }
        
    }

    render() {
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { Title, Company, Info, Price, Currency, productId, Viewed, SellerId, SellerName, Sold } = product;
        if (this.props.reviews) {
            data=this.props.reviews;
        }

        return (
            <Card>
                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>{I18n.t('PDP.Title')}:{Title}</Text>
                </CardSection>

                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>{I18n.t('PDP.Company')}:{Company}</Text>
                </CardSection>

                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>{I18n.t('PDP.SellerName')}:{SellerName}</Text>
                </CardSection>

                <CardSection>
                    <Image
                        style={{width: 150, height: 150}}
                        source={{uri: product.Image }}
                    />
                </CardSection>
                    
                <CardSection>
                    <Text>{I18n.t('PDP.Info')}: {Info}</Text>
                </CardSection>

                <CardSection>
                    <Text>{I18n.t('PDP.Views')}: {Viewed}</Text>
                </CardSection>

                <CardSection>
                    <Text>{I18n.t('Category.Price')}: {Price} {Currency}</Text>
                </CardSection>

                <CardSection>
                    <Text>{I18n.t('PDP.Rate')}: </Text>
                    <StarRating
                        disabled={false}
                        maxStars={5}
                        rating={this.state.starCount}
                        selectedStar={(rating) => this.onStarRatingPress(rating)}
                        fullStarColor='gold'
                    />
                </CardSection>
           
                {
                    !Sold && (SellerId !== this.state.uid) && 
                        <CardSection>
                            <Button 
                            title={I18n.t('PDP.AddToCart')}
                            onPress={()=>{this.props.addToCart(productId, this.state.user)}}
                            buttonStyle={{backgroundColor:Colors.primary, width:'93%'}}
                            />
                        </CardSection>
                } 
                {
                    (SellerId !== this.state.uid) &&
                        <CardSection>
                            <Button 
                            title={I18n.t('PDP.AddToWishlist')}
                            onPress={()=>{this.props.addToWishlist(productId, this.state.user)}}
                            buttonStyle={{backgroundColor:Colors.secondary, width:'90%'}}
                            />
                        </CardSection>
                } 
                {
                    Sold && 
                        <CardSection>
                            <Text>{I18n.t('PDP.Sold')}</Text>
                        </CardSection>  
                }

                <View style={{marginTop:5, width:'100%', justifyContent:'center', padding:8}}>
                    <Text style={{textAlign:'center', color:Colors.secondary, fontSize:18, fontWeight:'500'}}>{I18n.t('PDP.Reviews')}:</Text>
                </View>

                
                <View style={styles.FlatListStyle}>
                    <FlatList 
                        data={data}
                        renderItem={this.renderRow.bind(this)}   
                    />      
                </View>

                <View style={{marginTop:10}}>
                    <Input
                        label = {I18n.t('PDP.WriteReview')}
                        inputContainerStyle={styles.inputContainerStyle}
                        onChangeText= {this.onReviewChanged.bind(this) }
                        value = {this.state.review}
                        multiline
                        numberOfLines={3}
                        labelStyle={{color:Colors.primary, fontSize:16, fontWeight:'500'}}
                        // containerStyle={{backgroundColor}}

                    />
                </View>

                <View style={styles.reviewBtnContainer}>
                    <Button 
                        title={I18n.t('PDP.AddReview')}
                        onPress={()=>{
                            if (this.state.review) {
                                this.props.addReview(productId, SellerId, SellerName, this.state.review, this.state.user);
                                this.clearReview();
                            }
                           
                        }}
                        buttonStyle={{backgroundColor:Colors.primary}}
                    />
                </View>
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

const mapStateToProps = ({ addToCart, addToWishlist, incrementViews, reviewChanged, addReview, reviewFetch }) => {
    const { viewAdded } = incrementViews;
    const { addedToCart } = addToCart;
    const { addedToWishlist } = addToWishlist;
    const { review } = reviewChanged;
    const {reviewAdded } = addReview;
    const { reviews } = reviewFetch; 

    return  {addedToCart, addedToWishlist, viewAdded, review, reviewAdded, reviews };
};

export default connect(mapStateToProps, {addToCart, addToWishlist, incrementViews, reviewChanged, addReview, reviewFetch})(PDP);