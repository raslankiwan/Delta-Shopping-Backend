import React from 'react';
import { Text, Image, AsyncStorage } from 'react-native';
import { connect } from 'react-redux';
import { Card, CardSection, Header, Button } from '../components/common';
import { addToCart } from '../actions';

class PDP extends React.Component {

    state = {
        user: ''
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        this.setState({user});
    }
    

    render() {
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { Title, Company, Info, Price, Currency, productId } = product;
        
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
                    <Text>Price: {Price} {Currency}</Text>
                </CardSection>
           
                <CardSection>
                    <Button onPress={this.props.addToCart(productId, this.state.user)}>
                        Add to Cart
                    </Button>
                </CardSection>
            </Card>    
          
        );
    }
}

const mapStateToProps = ({ addToCart }) => {
    
    const { addedToCart } = addToCart;
  
    return  {addedToCart};
  };

export default connect(mapStateToProps, {addToCart})(PDP);