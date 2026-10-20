import React from 'react';
import { Text, View, Image } from 'react-native';
import { CardSection } from './common';

class ListItem extends React.Component {

    renderImage() {
        const ref = firebase.storage().refFromURL('gs://shopping-bfcfb.appspot.com/Lion.png');
        console.log(ref);
        const url = ref.getDownloadURL();
        console.log('url ', 'https://images-na.ssl-images-amazon.com/images/I/61McsadO1OL.jpg');
        return (
        <Image  style={{width: 50, height: 50}}
            source={{uri: 'https://images-na.ssl-images-amazon.com/images/I/61McsadO1OL.jpg' }}
        />);
    }
    
    render() {
        
        const { Title, image } = this.props.product;
        return (
           
                <View>
                    // <CardSection>
                        <Image  style={{width: 50, height: 50}}
                        source={{uri: 'https://images-na.ssl-images-amazon.com/images/I/61McsadO1OL.jpg' }}
                        />             
                   
                    // </CardSection>
                </View>

        );
    }
}

const styles = {
    titleStyle: {
        fontSize: 18,
        paddingLeft: 15
    }
};

export default ListItem;