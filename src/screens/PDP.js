import React from 'react';
import { 
    Text, 
    Image, 
    AsyncStorage,
    FlatList, View} from 'react-native';
import { connect } from 'react-redux';
import StarRating from 'react-native-star-rating';
import { Input, Rating, Avatar , Button, ListItem} from 'react-native-elements';
import firebase from 'firebase';
import { Card, CardSection, Header } from '../components/common';
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
        this.setState({user});
        
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { productId, Viewed } = product;
        
        this.setState({Viewed, productId, product})
        this.incrementViews(productId);
        this.props.reviewFetch(productId);
    }


    incrementViews =(productId) => {
        let incremented=parseInt(this.state.Viewed)+1;
        firebase.database().ref(productId).update({Viewed: incremented})
        
        // .on('value', snapshot => {
        //     console.log(snapshot.val());
        //     // let viewed = parseInt(snapshot.val().Viewed);
        //     // viewed += 1;
        //     // console.log('viewed', viewed);
        //     // firebase.database().ref(`${productId}/`).update({Viewed: viewed});
        // });
    }

    ratingCompleted(rating) {
        console.log("Rating is: " + rating)
    }

    onStarRatingPress(rating) {
        const uu= JSON.parse(this.state.user);

        this.setState({
          starCount: rating
        });
        console.log('rating', rating);
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
        console.log( 'render row',item);
        const { review, userId } = item.item;
        return(   
           <ListItem
           
           leftAvatar={
               <Avatar 
               rounded
                size='small'
                title='A'
               />
           }
           title={userId}
           subtitle={review}
           key={userId}
           containerStyle={{borderBottomColor:'#ddd', borderBottomWidth:1}}
           />
        );
    }
    
    onReviewChanged(text) {
        if (text.length !== 0){
            this.setState({ inputError: '' });
          } else {
            this.setState({ inputError: 'Please enter text here !!'})
          }
          this.props.reviewChanged(text);
    }

    render() {
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { Title, Company, Info, Price, Currency, productId, Viewed } = product;

        if(this.props.reviews){
            console.log('array length', this.props.reviews);
            data=this.props.reviews;
        }
       // this.props.incrementViews(productId);
        
        return (
            <Card>
                <CardSection>
                    <Text style={{ color:Colors.primary, fontSize:20, fontWeight:'600'}}>{Title + ' of ' + Company}</Text>
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
                    />
                </CardSection>
           
                <CardSection>
                    <Button 
                    title={I18n.t('PDP.AddToCart')}
                    onPress={()=>{this.props.addToCart(productId, this.state.user)}}
                    buttonStyle={{backgroundColor:Colors.primary, width:'93%'}}
                    />
                        
                </CardSection>
               
                <CardSection>
                    <Button 
                    title={I18n.t('PDP.AddToWishlist')}
                    onPress={()=>{this.props.addToWishlist(productId, this.state.user)}}
                    buttonStyle={{backgroundColor:Colors.secondary, width:'90%'}}
                    />
                </CardSection>
                    
                <View style={{marginTop:5, width:'100%', justifyContent:'center', padding:8}}>
                {/* <Divider style={{backgroundColor:Colors.lightGray, width:'100%', marginHorizontal:5, height:1}} /> */}
                    <Text style={{textAlign:'center', color:Colors.secondary, fontSize:18, fontWeight:'500'}}>{I18n.t('PDP.Reviews')}:</Text>
                </View>

                
                <View style={styles.FlatListStyle}>
                    <FlatList 
                        data={data}
                        renderItem={this.renderRow.bind(this)}   
                    />      
                </View>

                <View style={{marginTop:10}}>
                {/* <Text style={{textAlign:'center', color:Colors.secondary, fontSize:16, fontWeight:'500'}}>write your review:</Text> */}
                    <Input
                        label = {I18n.t('PDP.WriteReview')}
                        inputContainerStyle={styles.inputContainerStyle}
                        onChangeText= {this.onReviewChanged.bind(this) }
                        value = {this.props.review}
                        multiline
                        numberOfLines={3}
                        labelStyle={{color:Colors.primary, fontSize:16, fontWeight:'500'}}
                        // containerStyle={{backgroundColor}}

                    />
                </View>

                <View style={styles.reviewBtnContainer}>
                    {/* <Text>Write a review</Text> */}
                    <Button 
                    title={I18n.t('PDP.AddReview')}
                    onPress={()=>{this.props.addReview(productId, this.props.review, this.state.user)}}
                    buttonStyle={{backgroundColor:Colors.primary}}/>

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

    console.log('reviews, PDP:', reviews);
  
    return  {addedToCart, addedToWishlist, viewAdded, review, reviewAdded, reviews };
  };

export default connect(mapStateToProps, {addToCart, addToWishlist, incrementViews, reviewChanged, addReview, reviewFetch})(PDP);