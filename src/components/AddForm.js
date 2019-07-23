import React from 'react'
import {Text, View, Button, TextInput, Image} from 'react-native'
import {postRequest} from '../requestFetch'

export default class AddForm extends React.Component {

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
        this.onFail = this.onFail.bind(this)
    }

    componentDidMount() {
        // if(this.props.location && this.props.location.state && this.props.location.state.item) {
        //     let item = this.props.location.state.item
        //     if(item.Available==='Yes') {
        //         this.setState({isChecked:true})
        //     }
        //     else if(item.Available==='No') {
        //         this.setState({isChecked:false})
        //     }

        //     this.setState({
        //         name: item.Name,
        //         id: item.ID,
        //         desc: item.Description, 
        //         prod: item.Production, 
        //         exp: item.Expiration,
        //         available: item.Available
        //     })
        // }
        
    }

    onSuccess() {
        let path = `/home`
        this.props.navigation.navigate('Home');
    }

    onnSuccess() {
        
    }

    onFail() {
        this.setState({addErr: 'Something went wrong'})
    }
 
    doPut() {
        const { name, desc, exp, prod, id, available } = this.state
        console.log(available)
        var jsonObj = {
          name, desc, exp, prod, available
        }
        let url_g = localStorage.getItem('url_g')
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
                <Text>ProductID: </Text><TextInput type="number"  value={this.state.id} onChange={(text) => {
                    this.setState({id: text, emailErr:''})}
                    }>
                </TextInput>            
                <Text>Name: </Text><TextInput type="text" value={this.state.name} onChange={(text) => {
                    this.setState({name: text, emailErr:''})}
                    }>
                </TextInput>
                <Text>Description: </Text><TextInput type="textarea" value={this.state.desc} onChange={(text) => {
                    this.setState({desc: text, emailErr:''})}
                    }>
                </TextInput>
                <Text>Production: </Text><TextInput type="date" value={this.state.prod} onChange={(text) => {
                    this.setState({prod: text, emailErr:''})}
                    }>
                </TextInput>
                
                <Text>Expiration: </Text><TextInput type="date" defaultValue={this.state.exp} onChange={(text) => {
                    this.setState({exp: text, emailErr:''})}
                    }>
                </TextInput>
                <Text>Available? </Text><TextInput type="checkbox" checked={this.state.isChecked} onPress={this.checkAvailable} >                        
                </TextInput>
                
                {this.state.addErr !== '' && <View>{this.state.addErr}</View>}
                <Button onPress={()=> this.doPut()} title="Add Item" ></Button> 
                <Button onPress={()=> this.update()} title="Update Item" ></Button>

            
                <TextInput type="file" name='file' style={{marginTop:20}} onChange={(event) => this.viewImg(event)}/> 

                {this.state.imageName && <Image  style={{width: 100, height:100}} source={{uri:this.state.file_url}} />}


                <Button onPress={()=> this.uploadImage()} title="Upload Image" ></Button> 
            </View>
        );
    }
}