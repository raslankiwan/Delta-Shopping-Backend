import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Card, CardSection, Button } from '../components/common';

export default class CartScreen extends React.Component {
  static navigationOptions = {
    title: 'Cart',
  };

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
