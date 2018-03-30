
import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import {Editor, EditorState} from 'draft-js';
import * as Draft from "draft-js";
import {styles,endpoint} from "./consts";
import * as fs from 'fs';
import axios from 'axios';
const socket = socketIOClient(endpoint,{reconnect: true,forceNew:false,transports: ['websocket'], upgrade: false});
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {

            editorState: EditorState.createEmpty(),
            fileName : ''
        };
        this.fileRef= React.createRef();
        this.onChange = (editorState) => {
            this.setState({editorState});
            if(!this.interval)
                this.interval = setInterval(this.saveFile.bind(this),5000);
        };
    }


    // sending sockets
    send = () => {
        const data ={
            fileName:this.state.fileName,
            text:Draft.convertToRaw(this.state.editorState.getCurrentContent())
        }
        socket.emit('fileEdit', data); // change text

    };
    loadFile(e){

        const fileName = this.fileRef.current.value;
        const data = {
            fileName:fileName,
            headers: {"Access-Control-Allow-Origin": "*"}
        }
        axios.post(endpoint+'/openOrCreateFile/',data).then(response=>{
            console.log("loading file"+ fileName);
            console.log(JSON.stringify(response));

            if(response.data.data==''){
                this.setState({editorState:Draft.EditorState.createEmpty() ,fileName:fileName});
            }else{
                let contentState = Draft.EditorState.createWithContent(Draft.convertFromRaw(response.data));
                this.setState({editorState: contentState,fileName:fileName});
            }
        });

    }
    saveFile(e){
        let that = this;
        const data = {
            fileName:that.state.fileName,
            headers: {"Access-Control-Allow-Origin": "*"},
            text: Draft.convertToRaw(that.state.editorState.getCurrentContent())
        };
        const jsonData = JSON.stringify(data);
        axios.post(endpoint+'/saveFile/',data).then(response=>{
            console.log("data updated successfully");
        });
        this.send();
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    render() {
        // testing for socket connections

        const socket = socketIOClient(endpoint);
        socket.on('change text', (val) => {
            if(val.fileName===this.state.fileName) {
                let contentState = Draft.EditorState.createWithContent(Draft.convertFromRaw(val.text));
                this.setState({editorState: contentState});
            }
        });

        return (
            <div style={styles.root}>
                <input ref = {this.fileRef} type="text" placeholder="enter file name with location to edit" />
                <button onClick={this.loadFile.bind(this)}>Load File</button>
                <div style={styles.editor}>

                    <Editor editorState={this.state.editorState} onChange={this.onChange} />
                </div>
                <input
                    onClick={this.saveFile.bind(this)}
                    style={styles.button}
                    type="button"
                    value="Save File"
                />

            </div>
        )
    }
}


export default App;
