import React from "react";
import { StatusBar, StyleSheet,TouchableOpacity,KeyboardAvoidingView,BackHandler } from "react-native";
import { Image, Screen, Subtitle, Title, View, Heading } from "@shoutem/ui";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import { Button, Card, Colors, Snackbar, TextInput } from "react-native-paper";
import DeviceInfo from "react-native-device-info";
import NavigationActions from "../util/NavigationActions";
import auth from '@react-native-firebase/auth';

export default class BussinnessLoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.bindingBack = this.bindingBack.bind(this);
    this.state = {
      confirmResult: null,
      mobile: "",
      otp: "",
      progressView: false,
	    message: "",
      mode:0,
      exist:false,
      id:0,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.bindingBack);
	  this.unsubscribe = auth().onAuthStateChanged(user => {
			if (user) {
				this.setState({ user: user.toJSON() });
			}
		}); 
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.bindingBack);
    if (this.unsubscribe) this.unsubscribe();
  }

  bindingBack(){
    if(this.state.mode > 0){
      this.setState({ mode: 0, mobile: '', otp: '', confirmResult: null, progressView:false})
      return true;
    }else{
      return false;
    }
  }

  /**
   * signIn
   */
  signIn() {
	if(this.state.mode === 0){
		if (this.state.mobile === "") {
			this.setState({ message: "mobile number empty" });
		}else if(this.state.mobile.length < 10){
			this.setState({ message: "mobile number length empty" });
		} else if (this.state.mobile === '9876543210') {
			this.setState({ message: "invalid mobile number" });
		}else{
			this.setState({ progressView: true });
			const jsonData = JSON.stringify({
        value: this.state.mobile,
      });
			Helper.networkHelper(Pref.AccountCheckUrl, jsonData, Pref.methodPost, (result) => {
        this.setState({ progressView: false });
        //////console.log(result);
        if (Helper.checkJson(result)) {
          //////console.log('erx', result.idcustomer);
          this.setState({exist:true, id:result.idcustomer});
        }
        this.sendOTPCode(false);
			}, (error) => {
        //////console.log('er', error);
				this.setState({ progressView: false });
			});
		}
	}else if(this.state.mode === 1){
		if (this.state.otp === "") {
      this.setState({ message: "OTP number empty"});
		}else{
      this.setState({ progressView: true });
      const tt = this.state.otp;
      if (this.state.confirmResult){
        this.state.confirmResult.confirm(tt)
          .then((user) => {
            //////console.log('user', user);
            this.setState({ progressView: false });
            if(!this.state.exist){
              Helper.passParamItemClick(this.props, "Login", { mobile: this.state.mobile, uid: user.uid});
            }else{
              const tt = JSON.stringify({
                value:user.uid
              });
              Helper.networkHelper(Pref.UpdateTokenUrl + this.state.id, tt, Pref.methodPost, (result) => {
                const token = result["token"];
                if (token !== "") {
                  Pref.setVal(Pref.bearerToken, token);
                  Pref.setVal(Pref.loggedStatus, true);
                  Helper.itemClick(this.props, "Home");
                }
              }, (error) => {
                //////console.log('er', error);
                this.setState({ progressView: false });
              });

            }
          })
           .catch(error => {
            //////console.log('otpFailed', error);
            this.setState({ progressView: false,error:'OTP expired',message:true });
          });
      }
		}
	}
  };

  sendOTPCode(bal){
    const to = "+91" + this.state.mobile;
    auth().signInWithPhoneNumber(to, bal)
      .then(confirmResult => { 
          //////console.log(confirmResult);
        this.setState({ mode: 1, confirmResult: confirmResult, progressView: false });})
      .catch(error => this.setState({ message: "Auth Failed",progressView:false }));
    if (bal) {
      this.setState({ message: "OTP resent" });
    }
  }

  render() {
    return (
      <Screen style={{ backgroundColor: "white", }}>
        <StatusBar barStyle="dark-content" backgroundColor='white'/>
        <View styleName='space-between fill-parent vertical'>
          <Heading styleName='xl-gutter bold v-center h-center' style={{ padding: 4, color: "#292929", fontWeight: '700', fontSize: 24, }}>Call it</Heading>
          <View styleName='v-center h-center'>
            <Subtitle styleName='v-center h-center' style={{ color:'#292929', fontSize:16}}>Sign Up</Subtitle>
            <TextInput
              mode='flat'
              label={"Mobile Number"}
              underlineColor='transparent'
              underlineColorAndroid='transparent'
              style={[styles.inputStyle,]}
              placeholderTextColor={'#DEDEDE'}
              placeholder={"enter mobile number"}
              onChangeText={value => this.setState({ mobile: value })}
              value={this.state.mobile}
            />
            {this.state.mode > 0 ? <View style={{marginTop:16}}>
              <Subtitle styleName='v-center h-center' style={{ color: '#292929', fontSize: 16 }}>OTP</Subtitle>
              <TextInput
                mode='flat'
                underlineColor='transparent'
                underlineColorAndroid='transparent'
                label={"OTP"}
                placeholderTextColor={'#DEDEDE'}
                style={[styles.inputStyle]}
                placeholder={"enter OTP"}
                maxLength={6}
                keyboardType={'number-pad'}
                onChangeText={value => this.setState({ otp: value })}
                value={this.state.otp}
              />
              </View> : null}
            {this.state.mode !== 0 ?
              <TouchableOpacity onPress={() => this.sendOTPCode(true)}>
                <Subtitle styleName={'md-gutter v-center h-center'}>Resend OTP</Subtitle>
              </TouchableOpacity> : null}
          </View>
          <Image
            styleName="md-gutter large-banner v-center h-center"
            source={require('./../res/images/register.png')}
          />
          <Button 
            styleName=" muted border"
            mode={"flat"}
            uppercase={true}
            dark={true}
            loading={this.state.progressView}
            style={styles.loginButtonStyle}
            onPress={() => this.signIn()}
          >
            <Subtitle
              style={{ color: "white" }}>{this.state.progressView === true ? "PLEASE WAIT..." : this.state.mode === 0 ? 'Continue' : 'Verify'}</Subtitle>
          </Button>
          
        </View>
      
          <Snackbar
          visible={
            this.state.message === "" ? false : true
          }
          duration={1000}
          onDismiss={() =>
            this.setState({
              message: ""
            })
          }
        >
          {this.state.message}
        </Snackbar>
      </Screen>
    );
  }
}

/**
 * styles
 */
const styles = StyleSheet.create({
  inputStyle: {
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    color: '#292929',
    fontFamily: 'Rubik',
    fontSize: 24,
    marginHorizontal:24,
    fontWeight: '700',
  },
  loginButtonStyle: {
    color: "white",
    bottom:0,
    paddingVertical:6,
    width:'100%',
    backgroundColor: '#3daccf',
    textAlign: "center"
  }
});

