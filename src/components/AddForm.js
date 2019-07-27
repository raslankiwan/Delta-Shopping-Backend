import React from 'react'
import {Text, View, Button, TextInput, Image, AsyncStorage} from 'react-native'
import {postRequest} from '../requestFetch'

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

    checkAvailable =(event) => {
        console.log(event.target.checked)
        if(event.target.checked) {
            this.setState(prvs => { return {available:'Yes', isChecked:!prvs.isChecked};})
            console.log(this.state.available)
        }
        else {
            this.setState(prvs => { return {available:'No', isChecked:!prvs.isChecked};})
            console.log(this.state.available)
        }
    }

    viewImg(event) {
        let file = event.target.files[0]
        let file_url = URL.createObjectURL(file)
        this.setState({
            imageName: file.name,
            imageSource: file,
            file_url: file_url,
             
        })
    }

    uploadImage() {
        let url = "http://localhost:8080/upload_image";
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
            <View >
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
                <Text>Production: </Text><TextInput type="date" value={this.state.prod} onChangeText={(text) => {
                    this.setState({prod: text, emailErr:''})}
                    }>
                </TextInput>
                
                <Text>Expiration: </Text><TextInput type="date" defaultValue={this.state.exp} onChangeText={(text) => {
                    this.setState({exp: text, emailErr:''})}
                    }>
                </TextInput>
                <Text>Available? </Text><TextInput type="checkbox" checked={this.state.isChecked} onPress={this.checkAvailable} >                        
                </TextInput>
                
                {this.state.addErr !== '' && <Text>{this.state.addErr}</Text>}
                <Button onPress={()=> this.doPut()} title="Add Item" ></Button> 
                <Button onPress={()=> this.update()} title="Update Item" ></Button>

            
                <TextInput type="file" name='file' style={{marginTop:20}} onChange={(event) => this.viewImg(event)}/> 

                {this.state.imageName && <Image  style={{width: 100, height:100}} source={{uri:this.state.file_url}} />}


                <Button onPress={()=> this.uploadImage()} title="Upload Image" ></Button> 
            </View>
        );
    }
}