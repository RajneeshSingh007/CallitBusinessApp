import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Button,
  Snackbar,
  FAB,
  TextInput,
  Colors,
  Checkbox,
  Portal,
  Modal,
} from 'react-native-paper';
import {
  NavigationBar,
  Screen,
  Title,
  View,
  Subtitle,
  Image,
  Heading,
} from '@shoutem/ui';
import * as Pref from './../util/Pref';
import * as Helper from './../util/Helper';
import {Loader} from './../customer/Loader';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationAction from './../util/NavigationActions';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Moment from 'moment';
import {sizeWidth, sizeHeight} from '../util/Size';
import ImagePicker from 'react-native-image-crop-picker';
import {AlertDialog} from '../util/AlertDialog';
import {values} from 'mobx';
import {SafeAreaView} from 'react-navigation';

export default class BusinessGlobalProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      mobileNo: '',
      add1: '',
      progressView: false,
      bid: 0,
      address: '',
      token: '',
      cat: 0,
    };
  }

  componentDidMount() {
    Pref.getVal(Pref.bBearerToken, valuexx => {
      const removeQuotes = Helper.removeQuotes(valuexx);
      this.setState({token: removeQuotes});
    });
    this.saveData();
  }

  saveData() {
    Pref.getVal(Pref.bData, valuex => {
      let vv = JSON.parse(valuex);
      const mergr = JSON.parse(vv);
      this.setState({
        firstName: mergr.name,
        lastName: mergr.description,
        mobileNo: mergr.phone,
        add1: mergr.websiteUrl,
        address: mergr.email,
        cat: mergr.category,
      });
    });
  }

  /**
   * save account details
   */
  onSaveClick = () => {
    Pref.getVal(Pref.bId, vlx => {
      ////console.log('idbusiness', vlx);
      if (vlx !== undefined && vlx !== '') {
        this.setState({progressView: true});
        const jsonData = JSON.stringify({
          idbusiness: vlx,
          description: this.state.lastName,
          name: this.state.firstName,
          phone: this.state.mobileNo,
          websiteurl: this.state.add1,
          email: this.state.address,
          category: this.state.cat,
        });
        ////console.log('voy', jsonData);
        Helper.networkHelperTokenPost(
          Pref.UpdateBusiness + vlx,
          jsonData,
          Pref.methodPost,
          this.state.token,
          result => {
            Pref.setVal(Pref.bData, JSON.stringify(result));
            this.saveData();
            this.setState({progressView: false});
            ////console.log('result', result);
          },
          error => {
            this.setState({progressView: false});
          },
        );
      }
    });
  };

  render() {
    return (
      <SafeAreaView style={styles.maincontainer} forceInset={{top: 'never'}}>
        <Screen style={styles.maincontainer}>
          <StatusBar barStyle="dark-content" backgroundColor="white" />
          <NavigationBar
            styleName="inline no-border"
            style={{
              rightComponent: {
                flex: 0.4,
              },
              leftComponent: {
                flex: 0.5,
              },
              centerComponent: {
                flex: 0.1,
              },
              componentsContainer: {
                flex: 1,
              },
            }}
            leftComponent={
              <View style={{marginStart: 12, flexDirection: 'row'}}>
                <TouchableOpacity onPress={() => NavigationAction.goBack()}>
                  <Icon
                    name="arrow-forward"
                    size={32}
                    color="black"
                    style={{
                      padding: 4,
                      backgroundColor: 'transparent',
                    }}
                  />
                </TouchableOpacity>
                <Heading
                  style={{
                    fontSize: 20,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center',
                  }}>{`פרטים על העסק`}</Heading>
              </View>
            }
          />
          <View style={{flex: 1}}>
            <ScrollView style={{flex: 0.8}}>
              <View>
                <TextInput
                  dense={true}
                  style={styles.inputStyle}
                  mode={'flat'}
                  label={'שם העסק'}
                  onChangeText={text => {
                    this.setState({firstName: text});
                  }}
                  value={this.state.firstName}
                  returnKeyType="next"
                  multiline={true}
                  numberOfLines={1}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />
                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  label={'תיאור'}
                  onChangeText={text => {
                    this.setState({lastName: text});
                  }}
                  value={this.state.lastName}
                  returnKeyType="next"
                  multiline={true}
                  numberOfLines={1}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />
                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  label={'מספר פלאפון'}
                  onChangeText={text => {
                    this.setState({mobileNo: text});
                  }}
                  value={this.state.mobileNo}
                  keyboardType={'number-pad'}
                  multiline={true}
                  numberOfLines={1}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />
                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  label={'כתובת אינטרנט'}
                  numberOfLines={1}
                  onChangeText={text => {
                    this.setState({add1: text});
                  }}
                  value={this.state.add1}
                  multiline={true}
                  returnKeyType="next"
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />
                <TextInput
                  style={styles.inputStyle}
                  mode={'flat'}
                  label={'מייל'}
                  onChangeText={text => {
                    this.setState({address: text});
                  }}
                  value={this.state.address}
                  returnKeyType="next"
                  multiline={true}
                  numberOfLines={1}
                  underlineColor={'transparent'}
                  underlineColorAndroid={'transparent'}
                />
              </View>
            </ScrollView>
            <View style={{flex: 0.2, justifyContent: 'center'}}>
              <Button
                styleName=" muted border"
                mode={'contained'}
                uppercase={true}
                dark={true}
                loading={false}
                style={[styles.loginButtonStyle]}
                onPress={this.onSaveClick}>
                <Subtitle
                  style={{
                    color: 'white',
                  }}>
                  עדכון
                </Subtitle>
              </Button>
            </View>
          </View>

          <Loader isShow={this.state.progressView} />
        </Screen>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputStyle: {
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 24,
    marginHorizontal: sizeWidth(3),
    marginVertical: sizeHeight(2),
    fontWeight: '700',
  },
  loginButtonStyle: {
    color: 'white',
    paddingVertical: 6,
    backgroundColor: '#3daccf',
    justifyContent: 'center',
    textAlign: 'center',
    marginHorizontal: sizeWidth(3),
    //marginVertical: sizeHeight(2),

    //position:'absolute',
    //width:'100%',
    //bottom:0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
