import React from 'react'
import {Text, View, Button, TextInput, Image,ScrollView, AsyncStorage} from 'react-native'
import { CheckBox } from 'react-native-elements'
import {postRequest} from '../requestFetch'
import DatePicker from 'react-native-datepicker'
import ImagePicker from 'react-native-image-picker'

export default class AddForm extends React.Component {

    static navigationOptions = ({ navigation, navigationOptions }) => {
        const { params } = navigation.state;
    
        return ({
          title: 'Add',
          HeaderLeft:   <Button
                            title ="Back"
                            onPress={()=>{navigation.navigate('Home')}}
                        />
      });
    }

    options = {
        title: 'Select image',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

    constructor() {
        super()
        this.state = {
            name: '',
            id: '',
            desc: '',
            prod: '',
            exp: '',
            addErr: '',
            img: null,
            available: '',
            isChecked: false,
            file_url: null,
            imageName: null,
            imageSource: null,

            isUploading: false,
            isUploaded: false, 
            jsonResponse: {}
        }

        this.onSuccess = this.onSuccess.bind(this)
        this.onnSuccess = this.onnSuccess.bind(this)
        this.onFail = this.onFail.bind(this)
    }

    componentDidMount() {
        if(this.props.navigation) {
            let item = this.props.navigation.getParam('item', null)
            if (item !== null) {
                if(item.Available === 'Yes') {
                    this.setState({isChecked:true})
                }
                else if(item.Available === 'No') {
                    this.setState({isChecked:false})
                }
    
                this.setState({
                    name: item.Name,
                    id: item.ID,
                    desc: item.Description, 
                    prod: item.Production, 
                    exp: item.Expiration,
                    available: item.Available
                })
            }
        }
    }

    onSuccess() {
        this.props.navigation.navigate('Home');
    }

    onnSuccess() {
        this.props.navigation.navigate('Home');
    }

    onFail() {
        this.setState({addErr: 'This id is already in use!!'})
    }
 
    doPut = async() => {
        const { name, desc, exp, prod, id, available } = this.state
        console.log(available)
        var jsonObj = {
          name, desc, exp, prod, available
        }
        let url_g = await AsyncStorage.getItem('url_g')
        var url = `${url_g}/add_item/${id}`;
        postRequest(url, jsonObj, 'PUT', this.onnSuccess, this.onFail)
    }

    update = async () => {
        const { name, desc, exp, prod, id, available } = this.state
        var jsonObj = {
            name, desc, exp, prod, available
          }
        let url_g = await AsyncStorage.getItem('url_g')
        var url = `${url_g}/post_item/${id}`;
        postRequest(url, jsonObj, 'POST', this.onSuccess, this.onFail)
    }

    checkAvailable = () => {
        this.setState(prvs => { return {available:'Yes', isChecked:!prvs.isChecked};})
        console.log(this.state.isChecked)
    }

    viewImg() {

        ImagePicker.showImagePicker(this.options, (response) => {
            console.log('Response = ', response);
           
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.error) {
              console.log('ImagePicker Error: ', response.error);
            } else {
              this.setState({
                imageSource: response.uri,
                imageName: response.fileName
              });
            }
        });
    }

    uploadImage = async () => {
        let url_g = AsyncStorage.getItem('url_g')
        let url = `${url_g}/upload_image`
        console.log(url)
        const data = new FormData(); 
        data.append("file", this.state.imageSource); 
        data.append("imageName", this.state.imageName);
        data.append("id", this.state.id);
        this.setState({ isUploaded: false, isUploading: true })
        
        fetch(url, { 
            method: 'post', 
            body: data 
        }).then(response => { alert(response); return response.json(); }) 
            .then(json => { 
                this.setState({ isUploading: false, jsonResponse: json, isUploaded: true })                     
            })
            .then(() => this.onSuccess())
            .catch((error) => { 
                console.log(error); 
                alert("error:" + error)
                this.setState({ isUploading: false }); 
            });              
    }   

    render() {
        return(
            <ScrollView >
                <Text>Add new item</Text>
                <Text>ProductID: </Text><TextInput type="number"  value={this.state.id} onChangeText={(text) => {
                    this.setState({id: text, emailErr:''})}
                    }>
                </TextInput>            
                <Text>Name: </Text><TextInput type="text" value={this.state.name} onChangeText={(text) => {
                    this.setState({name: text, emailErr:''})}
                    }>
                </TextInput>
                <Text>Description: </Text><TextInput type="textarea" value={this.state.desc} onChangeText={(text) => {
                    this.setState({desc: text, emailErr:''})}
                    }>
                </TextInput>
                <Text>Production: </Text>
                <DatePicker
                    style={{width: 200}}
                    date={this.state.prod}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                    dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 0
                    },
                    dateInput: {
                        marginLeft: 36
                    }
                    // ... You can check the source to find the other keys.
                    }}
                    onDateChange={(date) => {this.setState({prod: date})}}
                />
                
                <Text>Expiration: </Text>
                <DatePicker
                    style={{width: 200}}
                    date={this.state.exp}
                    mode="date"
                    placeholder="select date"
                    format="YYYY-MM-DD"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                    dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 4,
                        marginLeft: 0
                    },
                    dateInput: {
                        marginLeft: 36
                    }
                    // ... You can check the source to find the other keys.
                    }}
                    onDateChange={(date) => {this.setState({exp: date})}}
                />
                <Text>Available? </Text>
                <CheckBox 
                    title="aaa" 
                    checked={this.state.isChecked} 
                    onPress={() => {
                        this.setState({ isChecked: !this.state.isChecked })
                        console.log(this.state.isChecked)
                    }}
                    
                    checkedColor='red'
                />
                
                {this.state.addErr !== '' && <Text>{this.state.addErr}</Text>}
                <Button onPress={()=> this.doPut()} title="Add Item" ></Button> 
                <Button onPress={()=> this.update()} title="Update Item" ></Button>

            
                <Button title='Select Image' style={{marginTop:20}} onPress={() => this.viewImg()}/> 

                {this.state.imageName && <Image  style={{width: 100, height:100}} source={{uri:this.state.imageSource}} />}


                <Button onPress={()=> this.uploadImage()} title="Upload Image" ></Button> 
            </ScrollView>
        );
    }
}