import React from 'react';
import { ScrollView, View } from 'react-native';

const CardSection = (props) => {
  return (
    <ScrollView>
      <View style ={[styles.containerStyle, props.style]}>
        {props.children}
      </View>
    </ScrollView>
  );
};

const styles = {
  containerStyle: {
    borderBottomWidth: 1,
    padding: 5,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    borderColor: '#ddd',
    position: 'relative'
  }
};

export { CardSection };
