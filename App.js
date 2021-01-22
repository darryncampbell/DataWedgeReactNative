/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, FlatList, TouchableHighlight, Alert} from 'react-native';
import {CheckBox, Button} from 'react-native-elements'
import { DeviceEventEmitter } from 'react-native';
import DataWedgeIntents from 'react-native-datawedge-intents';

type Props = {};
export default class App extends Component<Props> {
  constructor(Props) 
  {
    super(Props)
    this.state = {
      ean8checked: true,
      ean13checked: true, 
      code39checked: true, 
      code128checked: true, 
      lastApiVisible: false, 
      lastApiText: "Messages from DataWedge will go here",
      checkBoxesDisabled: true, 
      scanButtonVisible: false, 
      dwVersionText: "Pre 6.3.  Please create and configure profile manually.  See the ReadMe for more details",
      dwVersionTextStyle: styles.itemTextAttention,
      activeProfileText: "Requires DataWedge 6.3+",
      enumeratedScannersText: "Requires DataWedge 6.3+",
      scans: [],
    };
    //this.scans = [{decoder: 'label', timeAtDecode: 'time', data: '123'}, 
    //  {decoder: 'label', timeAtDecode: 'time', data: '321'}, 
    //  {decoder: 'label', timeAtDecode: 'time', data: '123'}]; 
    this.sendCommandResult = "false";
  }

  componentDidMount()
  {
    this.state.deviceEmitterSubscription = DeviceEventEmitter.addListener('datawedge_broadcast_intent', (intent) => {this.broadcastReceiver(intent)});
    this.registerBroadcastReceiver();
    this.determineVersion();
  }

  componentWillUnmount()
  {
    this.state.deviceEmitterSubscription.remove();
  }

  _onPressScanButton()
  {
    this.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');
  }

  determineVersion()
  {
    this.sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
  }

  setDecoders()
  {
    //  Set the new configuration
    var profileConfig = {
        "PROFILE_NAME": "ZebraReactNativeDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "PARAM_LIST": {
                //"current-device-id": this.selectedScannerId,
                "scanner_selection": "auto",
                "decoder_ean8": "" + this.state.ean8checked,
                "decoder_ean13": "" + this.state.ean13checked,
                "decoder_code128": "" + this.state.code128checked,
                "decoder_code39": "" + this.state.code39checked
            }
        }
    };
    this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
  }

  sendCommand(extraName, extraValue) {
    console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
    var broadcastExtras = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = this.sendCommandResult;
    DataWedgeIntents.sendBroadcastWithExtras({
        action: "com.symbol.datawedge.api.ACTION",
        extras: broadcastExtras});
  }

  registerBroadcastReceiver()
  {
    DataWedgeIntents.registerBroadcastReceiver({
      filterActions: [
          'com.zebra.reactnativedemo.ACTION',
          'com.symbol.datawedge.api.RESULT_ACTION'
      ],
      filterCategories: [
          'android.intent.category.DEFAULT'
      ]
    });
  }

  broadcastReceiver(intent)
  {
    //  Broadcast received
    console.log('Received Intent: ' + JSON.stringify(intent));
    if (intent.hasOwnProperty('RESULT_INFO')) {
        var commandResult = intent.RESULT + " (" +
            intent.COMMAND.substring(intent.COMMAND.lastIndexOf('.') + 1, intent.COMMAND.length) + ")";// + JSON.stringify(intent.RESULT_INFO);
        this.commandReceived(commandResult.toLowerCase());
    }

    if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_VERSION_INFO')) {
        //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX  
        var versionInfo = intent['com.symbol.datawedge.api.RESULT_GET_VERSION_INFO'];
        console.log('Version Info: ' + JSON.stringify(versionInfo));
        var datawedgeVersion = versionInfo['DATAWEDGE'];
        console.log("Datawedge version: " + datawedgeVersion);

        //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
        if (datawedgeVersion >= "6.3")
            this.datawedge63();
        if (datawedgeVersion >= "6.4")
            this.datawedge64();
        if (datawedgeVersion >= "6.5")
            this.datawedge65();

        this.setState(this.state);
    }
    else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS')) {
        //  Return from our request to enumerate the available scanners
        var enumeratedScannersObj = intent['com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS'];
        this.enumerateScanners(enumeratedScannersObj);
    }
    else if (intent.hasOwnProperty('com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE')) {
        //  Return from our request to obtain the active profile
        var activeProfileObj = intent['com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE'];
        this.activeProfile(activeProfileObj);
    }
    else if (!intent.hasOwnProperty('RESULT_INFO')) {
        //  A barcode has been scanned
        this.barcodeScanned(intent, new Date().toLocaleString());
    }
  }

  datawedge63()
  {
    console.log("Datawedge 6.3 APIs are available");
    //  Create a profile for our application
    this.sendCommand("com.symbol.datawedge.api.CREATE_PROFILE", "ZebraReactNativeDemo");

    this.state.dwVersionText = "6.3.  Please configure profile manually.  See ReadMe for more details.";
    
    //  Although we created the profile we can only configure it with DW 6.4.
    this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

    //  Enumerate the available scanners on the device
    this.sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

    //  Functionality of the scan button is available
    this.state.scanButtonVisible = true;

  }

  datawedge64()
  {
    console.log("Datawedge 6.4 APIs are available");

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.
    this.state.dwVersionText = "6.4.";
    this.state.dwVersionTextStyle = styles.itemText;
    //document.getElementById('info_datawedgeVersion').classList.remove("attention");

    //  Decoders are now available
    this.state.checkBoxesDisabled = false;

    //  Configure the created profile (associated app and keyboard plugin)
    var profileConfig = {
        "PROFILE_NAME": "ZebraReactNativeDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "BARCODE",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {}
        },
        "APP_LIST": [{
            "PACKAGE_NAME": "com.datawedgereactnative.demo",
            "ACTIVITY_LIST": ["*"]
        }]
    };
    this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

    //  Configure the created profile (intent plugin)
    var profileConfig2 = {
        "PROFILE_NAME": "ZebraReactNativeDemo",
        "PROFILE_ENABLED": "true",
        "CONFIG_MODE": "UPDATE",
        "PLUGIN_CONFIG": {
            "PLUGIN_NAME": "INTENT",
            "RESET_CONFIG": "true",
            "PARAM_LIST": {
                "intent_output_enabled": "true",
                "intent_action": "com.zebra.reactnativedemo.ACTION",
                "intent_delivery": "2"
            }
        }
    };
    this.sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
        this.sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    }, 1000);
  }

  datawedge65()
  {
    console.log("Datawedge 6.5 APIs are available");

    this.state.dwVersionText = "6.5 or higher.";

    //  Instruct the API to send 
    this.sendCommandResult = "true";
    this.state.lastApiVisible = true;
  }

  commandReceived(commandText)
  {
    this.state.lastApiText = commandText;
    this.setState(this.state);
  }

  enumerateScanners(enumeratedScanners)
  {
    var humanReadableScannerList = "";
    for (var i = 0; i < enumeratedScanners.length; i++)
    {
        console.log("Scanner found: name= " + enumeratedScanners[i].SCANNER_NAME + ", id=" + enumeratedScanners[i].SCANNER_INDEX + ", connected=" + enumeratedScanners[i].SCANNER_CONNECTION_STATE);
        humanReadableScannerList += enumeratedScanners[i].SCANNER_NAME;
        if (i < enumeratedScanners.length - 1)
            humanReadableScannerList += ", ";
    }
    this.state.enumeratedScannersText = humanReadableScannerList;
  }

  activeProfile(theActiveProfile)
  {
    this.state.activeProfileText = theActiveProfile;
    this.setState(this.state);
  }

  barcodeScanned(scanData, timeOfScan)
  {
    var scannedData = scanData["com.symbol.datawedge.data_string"];
    var scannedType = scanData["com.symbol.datawedge.label_type"];
    console.log("Scan: " + scannedData);
    this.state.scans.unshift({ data: scannedData, decoder: scannedType, timeAtDecode: timeOfScan });
    console.log(this.state.scans);
    this.setState(this.state);
  }

  render() {
    return (
      <ScrollView>
      <View style={styles.container}>
        <Text style={styles.h1}>Zebra ReactNative DataWedge Demo</Text>
        <Text style={styles.h3}>Information / Configuration</Text>
        <Text style={styles.itemHeading}>DataWedge version:</Text>
        <Text style={this.state.dwVersionTextStyle}>{this.state.dwVersionText}</Text>
        <Text style={styles.itemHeading}>Active Profile</Text>
        <Text style={styles.itemText}>{this.state.activeProfileText}</Text>
        { this.state.lastApiVisible && 
          <Text style={styles.itemHeading}>Last API message</Text>
        }
        { this.state.lastApiVisible && 
          <Text style={styles.itemText}>{this.state.lastApiText}</Text>
        }
        <Text style={styles.itemHeading}>Available scanners:</Text>
        <Text style={styles.itemText}>{this.state.enumeratedScannersText}</Text>
        <View style={{flexDirection: 'row', flex: 1}}>
          <CheckBox
            title='EAN 8'
            checked={this.state.ean8checked}
            disabled={this.state.checkBoxesDisabled}
            onPress={() => {this.state.ean8checked = !this.state.ean8checked;this.setDecoders(); this.setState(this.state)}}
          />
          <CheckBox
            title='EAN 13'
            checked={this.state.ean13checked}
            disabled={this.state.checkBoxesDisabled}
            onPress={() => {this.state.ean13checked = !this.state.ean13checked;this.setDecoders(); this.setState(this.state)}}
          />
        </View>
        <View style={{flexDirection: 'row', flex: 1}}>
          <CheckBox
            title='Code 39'
            checked={this.state.code39checked}
            disabled={this.state.checkBoxesDisabled}
            onPress={() => {this.state.code39checked = !this.state.code39checked;this.setDecoders(); this.setState(this.state)}}
          />
          <CheckBox
            title='Code 128'
            checked={this.state.code128checked}
            disabled={this.state.checkBoxesDisabled}
            onPress={() => {this.state.code128checked = !this.state.code128checked;this.setDecoders(); this.setState(this.state)}}
          />
        </View>
        {this.state.scanButtonVisible && 
          <Button
          title='Scan'
          color="#333333"
          buttonStyle={{
            backgroundColor: "#ffd200",
            height: 45,
            borderColor: "transparent",
            borderWidth: 0,
            borderRadius: 5,
          }}
          onPress={() => {this._onPressScanButton()}}
          />
        }

        <Text style={styles.itemHeading}>Scanned barcodes will be displayed here:</Text>

        <FlatList
          data={this.state.scans}
          extraData={this.state}
          keyExtractor={item => item.timeAtDecode}
          renderItem={({item, separators}) => (
            <TouchableHighlight
            onShowUnderlay={separators.highlight}
            onHideUnderlay={separators.unhighlight}>
            <View style={{
              backgroundColor: '#0077A0', 
              margin:10,
              borderRadius: 5,
            }}>
            <View style={{flexDirection: 'row', flex: 1}}>
            <Text style={styles.scanDataHead}>{item.decoder}</Text>
            <View style={{flex: 1}}>
              <Text style={styles.scanDataHeadRight}>{item.timeAtDecode}</Text>
            </View>
            </View>
            <Text style={styles.scanData}>{item.data}</Text>
            </View>
          </TouchableHighlight>
          )}
        />
 

      </View>
      </ScrollView>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
//    justifyContent: 'center',
//    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  h1: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
    fontWeight: "bold",
  },
  h3: {
    fontSize: 14,
    textAlign: 'center',
    margin: 10,
    fontWeight: "bold",
  },
  itemHeading: {
    fontSize: 12,
    textAlign: 'left',
    left: 10,
    fontWeight: "bold",
  },
  itemText: {
    fontSize: 12,
    textAlign: 'left',
    margin: 10,
  },
  itemTextAttention: {
    fontSize: 12,
    textAlign: 'left',
    margin: 10,
    backgroundColor: '#ffd200'
  },
  scanDataHead: {
    fontSize: 10,
    margin: 2,
    fontWeight: "bold",
    color: 'white',
  },
  scanDataHeadRight: {
    fontSize: 10,
    margin: 2,
    textAlign: 'right',
    fontWeight: "bold",
    color: 'white',
  },
  scanData: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: 'center',
    margin: 2,
    color: 'white',
  }
});
