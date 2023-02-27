import React from "react";
import { signInCommand } from './command';
export class Scanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = { deviceId: "" };
    }
    render() {
        return (
            <div>
                <h1>hello head</h1>
                <div onClick={() => this.scanBLE(this.updateState,this.state)}>
                    Scan
                </div>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
                <div onClick={() => this.connect(this.state,this.readResponse,this.readRandomNumberResponseBody,signInCommand)}>
                    Connect
                </div>
            <h2>Second head</h2>
                <br/>
                <br/>
                <br/>
                <div onClick={() => this.test(this.state)}>
                    Connect
                </div>

                <br/>
                <br/>
                <div onClick={() => this.test(this.state)}>
                    Connect
                </div>
        </div>);
    }

    async test(state){

        const data = new Uint8Array(20);
        //data[0] = 0x4F;
        data[0] = 0x40;
        await window.ble.withPromises.write(
            "CE040A5F-942E-0B7C-0B05-4015F22DDBF6",
            "00000000-0000-1000-8000-00805F9B34FB",
            "00000000-0000-1000-8000-00805F9B34FB", data.buffer);


    }
    async scanBLE(callBack,state) {

        await window.ble.startScan([],
            (data) => callBack(data,this.state)
            ,
            (item) => {console.log("+++++>>> WE GOT ONE FAILED" + item)});
    }

    async updateState(data ,state){
        console.log("+++++>>> WE GOT ONE " + JSON.stringify(data))
        if (data.name !== undefined && data.name == "0B10AD")  {
            console.log("+++++>>> WE GOT A LOCK!!!! " + JSON.stringify(data));
            state.deviceId = data.id;

            await window.ble.stopScan();
        }

        /*
        console.log("+++++>>> WE GOT ONE " + JSON.stringify(data))

            console.log("+++++>>> WE GOT A LOCK!!!! " + JSON.stringify(data));
            state.deviceId = data.id;

            await window.ble.stopScan();
        */
    }

    readRandomNumberResponseBody(numberBuffer) {
        let result = [];
        if (numberBuffer) {
            for (let i = 0; i < numberBuffer.length; i++) {
                result[i] = numberBuffer[i];
            }
        }
        const intArray = result.splice(2, result.length - 1);
        if (Array.isArray(intArray)) {
            return intArray.map(i => {
                let hex = i.toString(16);
                if (hex.length === 1) {
                    hex = '0' + hex;
                }
                return hex;
            }).join('');
        }
        return '';
    }

    readResponse(numberBuffer) {
        var responseCodes = {
            '68': 'AUTH FAILED',
            '69': 'Unknown command received from phone.',
            '70': 'Signed in correct',
            '79': 'Door Opened',
        };
        var responseType = numberBuffer[0];
        return {
            code: responseType,
            type: responseCodes[responseType]
        };
    }

    async connect(state,readResponse,readRandomNumber,scanInCommand){
        await window.ble.connect(
             state.deviceId,
            (pData) => {
                console.log("-----> connected " + JSON.stringify(pData))
                const enc = new TextDecoder("utf-8");
                window.ble.startNotification(
                    "CE040A5F-942E-0B7C-0B05-4015F22DDBF6",
                    "00000000-0000-1000-8000-00805F9B34FB",
                    "00000000-0000-1000-8000-00805F9B34FB",
                    (data) => {
                        let numberBuffer = new Uint8Array(data);
                        let response = readResponse(numberBuffer);
                        console.log('Response Received: ' + response.code + ':' + response.type);
                        const message = readRandomNumber(numberBuffer);
                        console.log("actual number: " + message);


                        window.ble.withPromises.write(
                            "CE040A5F-942E-0B7C-0B05-4015F22DDBF6",
                            "00000000-0000-1000-8000-00805F9B34FB",
                            "00000000-0000-1000-8000-00805F9B34FB",
                            signInCommand(1, "4b5be72fe75bed34638b17f5564fc260", message)).then(()=>{
                            console.log("====> try open");
                            let cmd = new Uint8Array(20);
                            cmd[0] = 0x4F;
                            window.ble.withPromises.write(
                                "CE040A5F-942E-0B7C-0B05-4015F22DDBF6",
                                "00000000-0000-1000-8000-00805F9B34FB",
                                "00000000-0000-1000-8000-00805F9B34FB",
                                cmd.buffer);

                        });
                    },
                    (e) => {
                        console.log('-----> failed to connect' + e)
                    });
            });
    }
}
/*
-----> connected {"name":"0B10AD","rssi":-67,
    "id":"CE040A5F-942E-0B7C-0B05-4015F22DDBF6","advertising":{"kCBAdvDataLocalName":"0016E2","kCBAdvDataIsConnectable":1,"kCBAdvDataManufacturerData":{}},
    "services":["00000000-0000-1000-8000-00805F9B34FB"],"state":"connected","characteristics":[{"properties":["Notify"],"isNotifying":false,"characteristic":"00000000-0000-1000-8000-00805F9B34FB","service":"00000000-0000-1000-8000-00805F9B34FB"},{"properties":["Read","Write"],"isNotifying":false,"characteristic":"00000000-0000-1000-8000-00805F9B34FB","service":"00000000-0000-1000-8000-00805F9B34FB"}]}
cordova.js:1413
*/
