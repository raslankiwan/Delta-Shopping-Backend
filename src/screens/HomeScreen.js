import React from 'react';
import {
  ListView,
  Platform,
  StyleSheet,
  Text,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import firebase from 'firebase';
import { ListItem } from '../components/ListItem';
import { productFetch, viewItem } from '../actions';
import { Card, CardSection, Header, Button } from '../components/common';

class HomeScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    products: []
  };
  componentWillMount() {
    this.props.productFetch();
    
  }

  createDataSource( _data ) {
    const ds = new ListView.DataSource({
        rowHasChanged: (r1, r2) => r1 !== r2
      });

    this.dataSource = ds.cloneWithRows(_data);

  }
   
  renderRow(product) {
    const { Title, Price, Currency } = product;
    return(   
      <TouchableWithoutFeedback onPress={()=>{this.viewItem(product)}}>
        <CardSection style={{flexDirection: 'column',}}>
          <Text>{Title}</Text>
          <Image
            style={{width: 150, height: 150}}
            source={{uri: product.Image }}
          />
          <Text>Price: {Price} {Currency}</Text>
          <Button>
            Add to Cart
          </Button>
        </CardSection>
      </TouchableWithoutFeedback>
    );
  }

  viewItem(product) {
    this.props.viewItem(product);
  }




  render() {
    this.createDataSource(this.props.products);
    return (
      <Card>
        <CardSection>
          <Header headerText="Home"></Header>
        </CardSection>

        <CardSection>
          <ListView
            enableEmptySections={true}
            renderRow={(item) => this.renderRow(item)}
            dataSource={this.dataSource}
          />       
        </CardSection>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: 'black',
        shadowOffset: { height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: 'center',
    backgroundColor: '#fbfbfb',
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});



const mapStateToProps = ({ productFetch }) => {
  const  {products, loading} = productFetch;
  
  return  {products, loading};
};

export default connect(mapStateToProps, { productFetch, viewItem })(HomeScreen);