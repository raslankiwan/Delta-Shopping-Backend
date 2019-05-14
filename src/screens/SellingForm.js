import React from 'react';
import {View, Text , ScrollView, Image, Keyboard, AsyncStorage, Picker} from 'react-native';
import {Input, Button,Icon} from 'react-native-elements';
import firebase from 'firebase';
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
        Image: null,
        Title: '',
        Price: '',
        Amount: '',
        Company: '',
        Info: '',
        Currency: '', 
        userId: '', 
        Category: 'laptops'
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        const uu= JSON.parse(user);
        this.setState({userId: uu.uid});
    }

    async _pickImage (handleChange) {
        let result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [4, 3]
        })
        console.log('result',result)
        if (!result.cancelled) {
          handleChange(result.uri)
        }
    }

    onSubmit(values) {
        //List of form values
        let { Image, Title, Price, Amount, Company, Info, Currency, userId, Category } = this.state;
        console.log(Title, Price, Amount, Company, Info, Currency, userId, Category);
        Keyboard.dismiss();
        console.log('values', JSON.stringify(values))
        firebase.database().ref(`/categories/${Category}`)
        .push({Amount, Company, Currency, Info, Price, Title, SellerId:userId, Viewed: 0, Image})
        .then(()=>{
            console.log('success');
        })
        
    }

    updateTitle = Title => {
        this.setState({Title});
    };

    updatePrice = Price => {
        this.setState({Price});
    };

    updateAmount = Amount => {
        this.setState({Amount});
    };

    updateCompany = Company => {
        this.setState({Company});
    };

    updateInfo = Info => {
        this.setState({Info});
    };

    updateCurrency = Currency => {
        this.setState({Currency});
    };

    render() {
        let { image, Title, Price, Amount, Company, Info, Currency } = this.state;

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
                            onChangeText = { this.updateTitle }
                            value={Title}
                        />
                        <Input
                            label={I18n.t('SellingForm.Price')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            onChangeText = { this.updatePrice }
                            value={Price}
                        />
                        <Input
                            label={I18n.t('SellingForm.Amount')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            onChangeText = { this.updateAmount }
                            value={Amount}
                        />
                        <Input
                            label={I18n.t('SellingForm.Company')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            onChangeText = { this.updateCompany }
                            value={Company}
                        />
                        <Input
                            label={I18n.t('SellingForm.Info')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            multiline
                            numberOfLines={4}
                            onChangeText = { this.updateInfo }
                            value={Info}
                        />
                        <Input
                            label={I18n.t('SellingForm.Currency')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            onChangeText = { this.updateCurrency }
                            value={Currency}
                        />

                        <Picker
                            selectedValue={this.state.Category}
                            style={{height: 50, width: '100%'}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({Category: itemValue})
                            }>
                            <Picker.Item label="Laptops" value="laptops" />
                            <Picker.Item label="Mobiles" value="mobiles" />
                        </Picker>

                        <View >
                            <Button
                                buttonStyle={styles.button}
                                onPress={() => {this._pickImage(handleChange('Image'))}}
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
                            {values.Image && values.Image.length > 0 ?
                                <Image source={{ uri: values.Image }} style={{ width: 200, height: 200 }} /> : null}
                            
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