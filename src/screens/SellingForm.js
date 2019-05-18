import React from 'react';
import {View, Text , ScrollView, Image, Keyboard, AsyncStorage, Picker} from 'react-native';
import {Input, Button,Icon} from 'react-native-elements';
import firebase from 'firebase';
import Colors from '../constants/Colors'
import I18n from '../language/i18n';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import { ImagePicker } from 'expo';
import _ from 'lodash';
import { RNS3 } from 'react-native-aws3';
import { Formik } from 'formik';

let options = {
    keyPrefix: "Album/",
    bucket: "awesometzumt",
    region: "ap-south-2",
    accessKey: "AKIAJPY233YYH4KTMLP",
    secretKey: "TS39s/q4+i+zk2QNqa7jO/QvlwTGYBEc5Db5ty5vz",
    successActionStatus: 201
  }

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
        Currency: '$', 
        userId: '', 
        priceError: '',
        infoError: '',
        titleError: '',
        companyError: '',
        catError: '',
        Category: 'laptops',
        submit: false
    };

    async componentWillMount() {
        let user = await AsyncStorage.getItem('userInfo');
        const uu= JSON.parse(user);
        this.setState({userId: uu.uid, username: uu.name});
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
        let { Image, Title, Price, Amount, Company, Info, Currency, userId, Category, username,
            priceError, infoError, titleError, companyError, catError
        } = this.state;
        if (  priceError === '' && infoError ==='' && titleError === '' && companyError === '' && catError === ''
            && Title !== '' && Price  !== '' && Company !== '' && Info  !== '' && Currency !== '' && Category !== ''
        ) {
            Keyboard.dismiss();
            //console.log('values', JSON.stringify(values))
            firebase.database().ref(`/categories/${Category}`)
            .push({
                Amount, 
                Company, 
                Currency, 
                Info, 
                Price, 
                Title, 
                SellerName: username ,
                SellerId:userId, 
                Viewed: 0, 
                Sold: false,
                Image})
            .then(()=>{
                console.log('success');
            })
    
        }
               
    }

    updateTitle = Title => {
        this.setState({Title});
        if (Title.length < 1) {
            this.setState({ titleError: I18n.t('SellingForm.titleError') })
        } else {
            this.setState({titleError: ''});
        }
    };

    updatePrice = Price => {
        this.setState({Price});

        if (Price.length < 1 || !/\d/.test(Price) ) {
            this.setState({ priceError: I18n.t('SellingForm.priceError') });
        } else {
            this.setState({ priceError: '' });
        }
    };

    updateAmount = Amount => {
        this.setState({Amount});
    };

    updateCompany = Company => {
        this.setState({Company});
        if (Company.length < 1  ) {
            this.setState({ companyError: I18n.t('SellingForm.companyError') });
        } else {
            this.setState({ companyError: '' });
        }
    };

    updateInfo = Info => {
        this.setState({Info});
        if (Info.length < 1  ) {
            this.setState({ infoError: I18n.t('SellingForm.infoError') });
        } else {
            this.setState({ infoError: '' });
        }
    };

    updateCurrency = Currency => {
        this.setState({Currency});
    };

    updateCat = Category => {
        this.setState({Category});
        if (Category.length < 1  ) {
            this.setState({ catError: I18n.t('SellingForm.catError') });
        } else {
            this.setState({ catError: '' });
        }
    }

    async onAddPhoto(){
        let result = await ImagePicker.launchImageLibraryAsync({
         allowsEditing: true,
         aspect: [4, 3],
        });
     
       if (!result.cancelled) {
         this.setState({ photo: result.uri });
         options["contentType"] = result.type
       };
       console.log('uri', result.uri);
     
    }

    onPressPost(){
        const photo = this.state;
        const imageRef = firebase.storage().ref('images').child('filename.jpg');

        return imageRef.put(photo, { contentType: 'application/octet-stream' })
          .then(() => {
            return imageRef.getDownloadURL();
          })
          .then(url => {
            resolve(url);
          })
          .catch(error => {
            reject(error);
            console.log('Error uploading image: ', error);
          });

    //     console.log('onPressPost', this)
    //     this.setState({ loading: true})
    //     const _this = this
    //     let post = {}
    //     post["id"] = firebase.database.ServerValue.TIMESTAMP
    //     post["text"] = this.state.text
    //     console.log('post id', post['id'])
    //     if (this.state.photo) {
    //       const uri = this.state.photo
    //       const ext = uri.substr(uri.lastIndexOf('.') + 1);
    //       const name = Math.round(+new Date()/1000);
    //       let file = {
    //         name: name+"."+ext,
    //         type: "image/"+ext,
    //         uri
    //       }
    //  console.log('state.photo', this.state.photo)
    //       RNS3.put(file, options).then(response => {
    //           console.log('RNS3 response',response )
    //           if (response.status === 400) {
    //             post["photo"] = response.body.postResponse.location;
    //             console.log('response status', post["photo"]);
    //             firebase.database().ref('/imgs').push(post)
    //             _this.setState({ text: '', photo: null, loading: false})
    //           }
    //       });
     
    //     } else {
    //       firebase.database().ref('imgs').push(post)
    //       _this.setState({ text: '', photo: null, loading: false})
    //     }
     
    }

    render() {
        let { image, Title, Price, Amount, Company, Info, Currency, Category,
            priceError, infoError, titleError, companyError, catError } = this.state;

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

                        {titleError!=='' && <Text style={styles.errorTextStyle}>{I18n.t('SellingForm.titleError')}</Text>}

                        <Input
                            label={I18n.t('SellingForm.Price')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            onChangeText = { this.updatePrice }
                            value={Price}
                        />

                        {priceError!=='' && <Text style={styles.errorTextStyle}>{I18n.t('SellingForm.priceError')}</Text>}

                        
                        <Input
                            label={I18n.t('SellingForm.Company')}
                            containerStyle={styles.containerInputStyle}
                            inputContainerStyle={styles.inputContainerStyle}
                            labelStyle={styles.InputLabel}
                            onChangeText = { this.updateCompany }
                            value={Company}
                        />
                        
                        {companyError!=='' && <Text style={styles.errorTextStyle}>{I18n.t('SellingForm.companyError')}</Text>}

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

                        {infoError!=='' && <Text style={styles.errorTextStyle}>{I18n.t('SellingForm.infoError')}</Text>}
                        
                        <Picker
                            selectedValue={this.state.Currency}
                            style={{height: 50, width: '80%'}}
                            onValueChange={(itemValue, itemIndex) =>
                                this.setState({Currency: itemValue})
                            }>
                            <Picker.Item label={I18n.t('SellingForm.USD')} value="USD" />
                            <Picker.Item label={I18n.t('SellingForm.JOD')} value="JOD" />
                            <Picker.Item label={I18n.t('SellingForm.NIS')} value="NIS" />
                        </Picker>

                        { Category !== 'other' && 
                            <Picker
                                selectedValue={this.state.Category}
                                style={{height: 50, width: '80%'}}
                                onValueChange={(itemValue, itemIndex) => {this.setState({Category: itemValue, catError:''})}
                                }>
                                <Picker.Item label={I18n.t('SellingForm.Laptops')} value="laptops" />
                                <Picker.Item label={I18n.t('SellingForm.Mobiles')} value="mobiles" />
                                <Picker.Item label={I18n.t('SellingForm.Clothes')} value="clothes" />
                                <Picker.Item label={I18n.t('SellingForm.Cars')} value="cars" />
                                <Picker.Item label={I18n.t('SellingForm.Other')} value="other" />
                                
                            </Picker>
                        }

                        { Category !== 'laptops' && Category !== 'mobiles' && Category !== 'cars'
                             && Category !== 'clothes' && 
                            <Input
                                label={I18n.t('SellingForm.Category')}
                                containerStyle={styles.containerInputStyle}
                                inputContainerStyle={styles.inputContainerStyle}
                                labelStyle={styles.InputLabel}
                                onChangeText = { this.updateCat }
                                value={Category}
                            />
                        }

                        {catError!=='' && <Text style={styles.errorTextStyle}>{I18n.t('SellingForm.catError')}</Text>}

                        <View >
                            <Button
                                buttonStyle={styles.button}
                                onPress={() => {this.onPressPost()}}
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
                            <Button
                                buttonStyle={styles.button}
                                onPress={this.onAddPhoto.bind(this)}
                                title="Add Photo"
                                icon={
                                    <Icon
                                        type="material-community"
                                        name="camera-image"
                                        size={25}
                                        color="white"
                                    />
                                }
                            />
                            {this.state.photo && this.state.photo.length > 0 ?
                                <Image source={{ uri: this.state.photo }} style={{ width: 200, height: 200 }} /> : null}
                            
                        </View>
                    
                        <Button 
                            title='Submit'
                            onPress={this.onSubmit.bind(this)} 
                            buttonStyle={styles.button}
                        />

                        <KeyboardSpacer/>
                    </View>
                )}
            </Formik>
        </ScrollView>
        )
    }
}

const styles={
    errorTextStyle: {
        fontSize: 20,
        alignSelf: 'center',
        color: '#ff8484'
    }, 
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