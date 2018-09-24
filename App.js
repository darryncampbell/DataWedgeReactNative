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
import DataWedgeIntents from 'react-native-datawedge-intents';

type Props = {};
export default class App extends Component<Props> {
  constructor(Props) 
  {
    super(Props)
    this.state = {ean8checked: true, ean13checked: true, code39checked: true, code128checked: true};
    this.scans = {data: [{labelType: 'label', time: 'time', scanData: '123'}, {labelType: 'label', time: 'time', scanData: '321'}, {labelType: 'label', time: 'time', scanData: '123'}]}; 
  }

  _onPressScanButton()
  {
    DataWedgeIntents.sendIntent(DataWedgeIntents.ACTION_SOFTSCANTRIGGER,DataWedgeIntents.TOGGLE_SCANNING);
  }

  render() {
    return (
      <ScrollView>
      <View style={styles.container}>
        <Text style={styles.h1}>Zebra Cordova DataWedge Demo</Text>
        <Text style={styles.h3}>Information / Configuration</Text>
        <Text style={styles.itemHeading}>DataWedge version:</Text>
        <Text style={styles.itemText}>Pre 6.3.  Please create &amp; configure profile manually.  See the ReadMe for more details</Text>
        <Text style={styles.itemHeading}>Active Profile</Text>
        <Text style={styles.itemText}>Requires DataWedge 6.3+</Text>
        <Text style={styles.itemHeading}>Last API message</Text>
        <Text style={styles.itemText}>Messages from DataWedge will go here</Text>
        <Text style={styles.itemHeading}>Available scanners:</Text>
        <Text style={styles.itemText}>Rrequires DataWedge 6.3+</Text>
        <View style={{flexDirection: 'row', flex: 1}}>
          <CheckBox
            title='EAN 8'
            checked={this.state.ean8checked}
            onPress={() => this.setState({ean8checked: !this.state.ean8checked})}
          />
          <CheckBox
            title='EAN 13'
            checked={this.state.ean13checked}
            onPress={() => this.setState({ean13checked: !this.state.ean13checked})}
          />
        </View>
        <View style={{flexDirection: 'row', flex: 1}}>
          <CheckBox
            title='Code 39'
            checked={this.state.code39checked}
            onPress={() => this.setState({code39checked: !this.state.code39checked})}
          />
          <CheckBox
            title='Code 128'
            checked={this.state.code128checked}
            onPress={() => this.setState({code128checked: !this.state.code128checked})}
          />
        </View>
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
        <FlatList
          data={this.scans.data}
          keyExtractor={item => item.time}
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
            <Text style={styles.scanDataHead}>{item.labelType}</Text>
            <Text style={styles.scanDataHead}>{item.time}</Text>
            </View>
            <Text style={styles.scanData}>{item.scanData}</Text>
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
  scanDataHead: {
    fontSize: 10,
    margin: 2,
    fontWeight: "bold",
    color: 'white',
  },
  scanData: {
    fontSize: 14,
    textAlign: 'center',
    margin: 2,
    color: 'white',
  }
});
