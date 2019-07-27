import React from 'react';
import { AppRegistry } from "react-native";
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
//import ReactUploadImage from './ReactUploadImage'
import * as serviceWorker from './serviceWorker';
import { name as appName } from "./app.json";  
AppRegistry.registerComponent(appName, () => App);
ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
