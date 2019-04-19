import React from 'react';
import { Text, Image } from 'react-native';
import { Card, CardSection, Header, Button } from '../components/common';
class PDP extends React.Component {

    render() {
    
        const { navigation } = this.props;
        const product = navigation.getParam('product','there is no details ');
        const { Title, Company, Info, Price, Currency } = product;
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
                    <Button onPress={()=>{}}>
                        Add to Cart
                    </Button>
                </CardSection>
            </Card>    
          
        );
    }
}

export default PDP;