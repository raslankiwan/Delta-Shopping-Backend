import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { connect } from 'react-redux';
import { Card, CardSection, Button } from '../components/common';
import { cartFetch } from '../actions';

class CartScreen extends React.Component {

  componentWillMount() {
    this.props.cartFetch();
    
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <Card>
          <CardSection style={{flexDirection: 'column',}}>
            <Text>Cart subtotal: </Text>
            <Button> Proceed to checkout</Button>
          </CardSection>
        </Card>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});

export default connect(null, { cartFetch})(CartScreen);