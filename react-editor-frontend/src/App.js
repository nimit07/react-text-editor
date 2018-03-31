
import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import {Editor, EditorState,ContentState} from 'draft-js';
import * as Draft from "draft-js";
import {styles,endpoint} from "./consts";
import axios from 'axios';
import DraftPasteProcessor from 'draft-js/lib/DraftPasteProcessor';
import {stateToHTML} from 'draft-js-export-html';
const socket = socketIOClient(endpoint,{reconnect: true,forceNew:false,transports: ['websocket'], upgrade: false});
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {

            editorState: EditorState.createEmpty(),
            fileName : '',
            intervalCount:0
        };
        this.fileRef= React.createRef();
        this.onChange = (editorState) => {
            this.setState({editorState:editorState});
            if(this.state.intervalCount==0){
                this.interval = setInterval(this.saveFile.bind(this),5000);
                this.setState({intervalCount:1});
            }

        };
    }


    // sending sockets
    send = () => {
        let html = stateToHTML(this.state.editorState.getCurrentContent());
        console.log(html);
        const data ={
            fileName:this.state.fileName,
            text:html
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

            if(Object.keys(response.data).length === 0 && response.data.constructor === Object){
                this.setState({editorState:Draft.EditorState.createEmpty() ,fileName:fileName});
            }else{
                console.log(response.data.data);
                const processedHTML = DraftPasteProcessor.processHTML(response.data.data);
                const contentState = EditorState.createWithContent(ContentState.createFromBlockArray(processedHTML));

                //let contentState = Draft.EditorState.createWithContent(Draft.convertFromRaw(response.data['data']));
                this.setState({editorState: contentState,fileName:fileName});
            }
        });

    }
    saveFile(e){
        let that = this;
        let html = stateToHTML(this.state.editorState.getCurrentContent());
        const data = {
            fileName:that.state.fileName,
            headers: {"Access-Control-Allow-Origin": "*"},
            text: html
        };
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
                const processedHTML = DraftPasteProcessor.processHTML(val.text);
                const contentState = EditorState.createWithContent(ContentState.createFromBlockArray(processedHTML));
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
