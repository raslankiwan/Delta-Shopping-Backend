import React from 'react';
import {View, Text , ScrollView, Image, Keyboard} from 'react-native';
import {Input, Button,Icon} from 'react-native-elements';
import Colors from '../constants/Colors'
import I18n from '../language/i18n';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { ImagePicker } from 'expo';
import { Formik } from 'formik';
const initialValues = {
    title: '',
    image: ''
  }
class SellingForm extends React.Component {
    state = {
        image: null,
    };
    async _pickImage (handleChange) {
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3]
        })
        console.log(result)
        if (!result.cancelled) {
          handleChange(result.uri)
        }
    }
    onSubmit(values) {
        //List of form values
        console.log(values);
        Alert.alert(JSON.stringify(values));
        Keyboard.dismiss();
      }
    render(){
        let { image } = this.state;
        return(
            <ScrollView>
    
                <Formik 
                initialValues={initialValues} 
                onSubmit={this.onSubmit.bind(this)}>
                {({ handleChange, handleSubmit, values }) => (
                    <View>
                    <Input
                    label={I18n.t('SellingForm.Title')}
                    containerStyle={styles.containerInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    labelStyle={styles.InputLabel}
                    />
                    <Input
                    label={I18n.t('SellingForm.Price')}
                    containerStyle={styles.containerInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    labelStyle={styles.InputLabel}
                    />
                    <Input
                    label={I18n.t('SellingForm.Amount')}
                    containerStyle={styles.containerInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    labelStyle={styles.InputLabel}
                    />
                    <Input
                    label={I18n.t('SellingForm.Company')}
                    containerStyle={styles.containerInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    labelStyle={styles.InputLabel}
                    />
                    <Input
                    label={I18n.t('SellingForm.Info')}
                    containerStyle={styles.containerInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    labelStyle={styles.InputLabel}
                    multiline
                    numberOfLines={4}
                    />
                    <Input
                    label={I18n.t('SellingForm.Currency')}
                    containerStyle={styles.containerInputStyle}
                    inputContainerStyle={styles.inputContainerStyle}
                    labelStyle={styles.InputLabel}
                    />
                    <View >
                        <Button
                            buttonStyle={styles.button}
                            onPress={() => {this._pickImage(handleChange('image'))}}
                            icon={
                                <Icon
                                 type="material-community"
                                  name="camera-image"
                                  size={25}
                                  color="white"
                                />
                              }
                              title='Pick'
                        />
                        {values.image && values.image.length > 0 ?
                            <Image source={{ uri: values.image }} style={{ width: 200, height: 200 }} /> : null}
                        
                    </View>
                   
                    <Button 
                        title='Submit'
                        onPress={handleSubmit} 
                        buttonStyle={styles.button}/>
                    <KeyboardSpacer/>
                    </View>
                    
                )}
            </Formik>
                  
           
        
        </ScrollView>
        )
    }
}
const styles={
    containerInputStyle:{
        marginTop: 5,
    }, 
    inputContainerStyle:{
        borderBottomWidth: 0, 
        backgroundColor:'#f1e4e4',
        marginBottom: 5,
        padding:5, 
        
    }, 
    InputLabel:{
        color:Colors.primary, 
        
    }, 
    button:{
        width:'30%', 
        margin:10, 
        backgroundColor:Colors.primary
    }
}
export default SellingForm;