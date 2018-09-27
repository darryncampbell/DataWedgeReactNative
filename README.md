# Zebra ReactNative Demo

*This plugin is provided without guarantee or warranty*
=========================================================

# Integrating DataWedge into your React Native application

This application shows how DataWedge functionality can be seamlessly integrated into your new or existing ReactNative applications using the 3rd party react-native-datawedge-intents module.

![Application](https://raw.githubusercontent.com/darryncampbell/DataWedgeReactNative/work_in_progress/screenshots/application_01.png)

## DataWedge Intent Interface
DataWedge is a value-add of all Zebra Technologies devices (formally Symbol and Motorola Solutions) that allows barcode capture and configuration without the need to write any code.  This application will demonstrate how to use Android intents to add DataWedge scanning functionality to your application

## Installation / Quick Start
* `git clone https://github.com/darryncampbell/DataWedgeReactNative.git`
* `cd DataWedgeReactNative`
* npm install
* react-native run-android

## Setup
Any Zebra mobile computer running Android which supports Datawedge should work with this sample but the complexity of setup will depend on your Datawedge version 

---
If your device is running Datawedge 6.4 or higher you will see no warning messages and can safely skip this step
---
You will see this message if you are running a version of Datawedge prior to 6.3:

![Pre-6.3 warning message](https://raw.githubusercontent.com/darryncampbell/DataWedgeReactNative/work_in_progress/screenshots/pre_6.3_message.png)

And this message if you are running Datawedge 6.3:

![6.3 warning message](https://raw.githubusercontent.com/darryncampbell/DataWedgeReactNative/work_in_progress/screenshots/6.3_message.png)

In either case, ensure you have a Datawedge profile on the device.  You can do this by:
- Launching the Datawedge application
- (Prior to 6.3 only) Select Menu --> New Profile and name the profile `ZebraReactNativeDemo`
- Configure the ZebraReactNativeDemo profile to 
  - Associate the profile with com.datawedgereactnative.demo, with * Activities (Note: You need to have previously run the application on the device to complete this step)
  - Configure the intent output plugin to send broadcast intents to `com.zebra.reactnativedemo.ACTION` (Note: the action changed with the update made in March 2018)
  
![Profile configuration 1](https://raw.githubusercontent.com/darryncampbell/DataWedgeReactNative/work_in_progress/screenshots/datawedge_associated_apps.png)

![Profile configuration 2](https://raw.githubusercontent.com/darryncampbell/DataWedgeReactNative/work_in_progress/screenshots/datawedge_02.png)

## Use
There are two sections to the UI, at the top you can configure scanning attributes such as choosing the enabled decoders.  Note that some configuration features will require a minimum version of Datawedge.  You can initiate a soft trigger scan using the yellow button.

**All** versions of Datawedge support scanning barcodes with the hardware trigger.

## Integrating into your own app
In order to interact with the Datawedge service on Zebra devices this application relies on a 3rd party component to provide the Android Intent interface.  Please be sure to add the [ReactNative DataWedge Intents module](https://www.npmjs.com/package/react-native-datawedge-intents) to your application if you are using this code as a template for your own application.  **A minimum version of 0.1.0 is required** for this demo app to function:

`npm install react-native-datawedge-intents --save`

##  Code examples
Now to hook up our logic to listen for and send intents.

### Listening for intents
Since we configured DataWedge to send barcode data to our application via an implicit broadcast intent we can use the 3rd party module to register a broadcast receiver:
```javascript
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
```

### Sending intents
DataWedge supports an intent based API [documented here](http://techdocs.zebra.com/datawedge/6-8/guide/api/) which supports scanner configuration & control.  The below code shows how to simulate a trigger press and disable the scanner entirely:

To simulate a trigger press:
```javascript
    this.sendCommand("com.symbol.datawedge.api.SOFT_SCAN_TRIGGER", 'TOGGLE_SCANNING');
```

With the sendCommand function being defined as follows:
```javascript
    sendCommand(extraName, extraValue) {
      console.log("Sending Command: " + extraName + ", " + JSON.stringify(extraValue));
      var broadcastExtras = {};
      broadcastExtras[extraName] = extraValue;
      DataWedgeIntents.sendBroadcastWithExtras({
          action: "com.symbol.datawedge.api.ACTION",
          extras: broadcastExtras});
    }
```

## Feedback
Please feel free to raise github issues on this repository or post comments to the upcoming accompanying blog (when available).
