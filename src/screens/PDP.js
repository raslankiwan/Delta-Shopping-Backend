import React from 'react';
import { 
    Text, 
    Image, 
    AsyncStorage,
    FlatList } from 'react-native';
import { connect } from 'react-redux';
import { Input } from 'react-native-elements';
import { Card, CardSection, Header, Button } from '../components/common';
import { addToCart, addToWishlist, incrementViews, reviewChanged, addReview, reviewFetch } from '../actions';
// import console = require('console');

var data=[];
class PDP extends React.Component {

    state = {
        user: '',
        review: '',
        reviews:[]
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        this.setState({user});
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { productId } = product;

        this.props.reviewFetch(productId);
    }

       
    renderRow(item) {
    console.log( 'render row',item);
    const { review, userId } = item.item;
    return(   
        <CardSection style={{flexDirection:'column'}}>
                <CardSection>
                    <Text>{userId}</Text>
            </CardSection>

            <CardSection>
                <Text>{review}</Text>
            </CardSection>
        </CardSection>    
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
                    <Header headerText={Title + ' of ' + Company}></Header>
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
                    <Text>Views: {Viewed}</Text>
                </CardSection>

                <CardSection>
                    <Text>Price: {Price} {Currency}</Text>
                </CardSection>
           
                <CardSection>
                    <Button onPress={()=>{this.props.addToCart(productId, this.state.user)}}>
                        Add to Cart
                    </Button>
                </CardSection>

                <CardSection>
                    <Button onPress={()=>{this.props.addToWishlist(productId, this.state.user)}}>
                        Add to Wishlist
                    </Button>
                </CardSection>
                    
                <CardSection>
                    <Text>Reviews:</Text>
                </CardSection>

                
                <CardSection style={styles.FlatListStyle}>
                    <FlatList 
                        data={data}
                        renderItem={this.renderRow.bind(this)}   
                    />      
                </CardSection>

                <CardSection>
                    <Input
                        placeholder = ""
                        inputContainerStyle={{borderBottomWidth: 0}}
                        onChangeText= {this.onReviewChanged.bind(this) }
                        value = {this.props.review}
                    />
                </CardSection>

                <CardSection>
                    <Text>Write a review</Text>
                    <Button onPress={()=>{this.props.addReview(productId, this.props.review, this.state.user)}}>
                        Add Review
                    </Button>
                </CardSection>
            </Card>    
          
        );
    }
}

const styles = {
    FlatListStyle:{
        borderTopWidth: 0,
        borderBottomWidth: 0,
        marginBottom:150, 
         flex:1
    } 
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