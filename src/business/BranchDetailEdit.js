import React from "react";
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, Platform, TouchableWithoutFeedback,FlatList,Alert} from "react-native";
import { Button, TextInput, Checkbox, Portal,Modal} from "react-native-paper";
import { NavigationBar, Screen, View,Subtitle,Image,Heading} from "@shoutem/ui";
import * as Pref from "./../util/Pref";
import * as Helper from "./../util/Helper";
import {Loader} from './../customer/Loader';
import Geolocation from '@react-native-community/geolocation';
import Icon from "react-native-vector-icons/MaterialIcons";
import NavigationAction from "./../util/NavigationActions";
import DateTimePicker from "react-native-modal-datetime-picker";
import Moment from "moment";
import { sizeWidth, sizeHeight } from "../util/Size";
import ImagePicker from "react-native-image-crop-picker";




//SD = single Day 
export default class BranchDetailEdit extends React.Component {
    constructor(props) {
        super(props);
        this.onImageClick = this.onImageClick.bind(this);
        this.state = {
            imageBase64:"",
            imageName:"",
            imageLoc:"",
            firstName: "",
            lastName: "",
            mobileNo: "",
            add1: "",
            businessTime:"",
            rating:"",
            delivery:"",
            location:"",
            progressView: false,
            bid:0,
            lat:'',
            lon:'',
            address:'',
            disabled:false,
            timePick:false,
            token:'',
            fkbusinessNavigation: null,
            deliveryPrice: null,
            order: [],
            service: [],
            userdelivery: [],
            useremployee: [],
            usermanager: [],
            sun:'ראשון',
            mon:'שני',
            tue:'שלישי',
            wed:'רביעי',
            thur:'חמישי',
            fri:'שישי',
            sat:'שבת',
            showWeekDays:false,
            showdialogtime:false,
            modexx:0,
            temptimeshow:false,
            hasDelivery:0,
            times:[],
            IndexClicked:-1,
            timePickerShow:false,
            timePickerOnOpen:true,
            day:'day',

        };
    }

    componentDidMount(){
        this.fetchInfo();
        
    }

    /**
   * ImageChooser
   */
    onImageClick = () => {
        ImagePicker.openPicker({
            width: 400,
            height: 400,
            cropping: false,
            multiple: false,
            includeBase64: true
        }).then(image => {
            const split = image.path.split("/");
            const lastNumber = split.length;
            let iosFileName = "";
            if (Platform.OS === "android") {
                iosFileName = split[lastNumber - 1];
            } else {
                iosFileName = image.filename;
            }
            this.setState({ imageLoc: image.path, imageBase64: image.data, imageName: iosFileName });
        });
    }

    fetchInfo(){
        const { state } = this.props.navigation;
        const data = state.params.data;
        //console.log("/n", data.fullOpeningHours);
        //////console.log('imageBase64', data);
        ////console.log('businessHours', sp.length > 0 ? 'ראשון' : 'ראשון ' + sp[0]);
        let sun = 'ראשון';
        let mon = 'שני';
        let tue = 'שלישי';
        let wed = 'רביעי';
        let thur = 'חמישי';
        let fri = 'שישי';
        let sat = 'שבת';
        // console.log(data.fullOpeningHours);
        //console.log("Times:\n", data.fullBusinessHours);

        if (data.businessHours  !== undefined && data.businessHours  !== null){
            const sp = data.businessHours .split('\n');
            
            if (sp.length > 0) {
                sun = sp[0];
            }
            if (sp.length > 1) {
                mon = sp[1];
            }
            if (sp.length > 2) {
                tue = sp[2];
            }
            if (sp.length > 3) {
                wed = sp[3];
            }
            if (sp.length > 4) {
                thur = sp[4]
            }
            if (sp.length > 5) {
                fri = sp[5];
            }
            if (sp.length > 6) {
                sat = sp[6];
            }
        }else{
             sun = 'ראשון';
             mon = 'שני';
             tue = 'שלישי';
             wed = 'רביעי';
             thur = 'חמישי';
             fri = 'שישי';
             sat = 'שבת';
        }

        this.setState({
            sun:sun,
            mon: mon,
            tue: tue,
            wed: wed,
            thur: thur,
            fri: fri,
            sat: sat,
            bid:data.idbranch,
            firstName:data.name,
            lastName:data.description,
            address: data.address,
            mobileNo:data.phone,
            businessTime:data.businessHours ,
            add1:data.message,
            rating: String(data.rating),
            lon:data.lon,
            lat:data.lat,
            delivery: Number(data.delivery),
            hasDelivery: data.hasDelivery,
            fkbusinessNavigation: null,
            deliveryPrice: data.deliveryPrice,
            order: data.order,
            service: data.service,
            userdelivery: data.userdelivery,
            useremployee: data.useremployee,
            usermanager: data.usermanager
        });
        this.fetchLoc();
        Pref.getVal(Pref.bBearerToken, value => {
            const removeQuotes = Helper.removeQuotes(value);
            this.setState({ token: removeQuotes });
        });
    }

	/**
	 * save account details
	 */
    onSaveClick = () => {
        
        let businessTime = `${this.state.sun}\n${this.state.mon}\n${this.state.tue}\n${this.state.wed}\n${this.state.thur}\n${this.state.fri}\n${this.state.sat}`;
        // console.log("TIMES:");
         //console.log(businessTime);
        // return;
        this.setState({ progressView: true });
        
        

        //console.log('businessTime', businessTime);

        const jsonData = JSON.stringify({
            "idbranch": this.state.bid,
            "address": this.state.address,
            "name": this.state.firstName,
            "description": this.state.lastName,
            "message": this.state.add1,
            "phone": this.state.mobileNo,
            "BusinessHours": businessTime,
            "rating": Number(this.state.rating),
            "lon": this.state.lon,
            "lat": this.state.lat,
            "hasDelivery": this.state.hasDelivery,
            "fkbusinessNavigation": null,
            "deliveryPrice": this.state.deliveryPrice,
            "order": this.state.order,
            "service": this.state.service,
            "userdelivery": this.state.userdelivery,
            "useremployee": this.state.useremployee,
            "usermanager": this.state.usermanager,
            //"imageUrl":this.state.imageBase64,
        });

        Pref.getVal(Pref.bId, vlx =>{
            const vl = this.state.imageBase64;
            if (vl !== undefined && vl !== '') {
                const uu = JSON.stringify({
                    filename: this.state.imageName,
                    content: this.state.imageBase64
                });
                Helper.networkHelperTokenPost(Pref.LogoURL + vlx, uu, Pref.methodPost, this.state.token, result => {
                    //////console.log('logo', result);
                }, error => {

                });
            }
        });
        Pref.getVal(Pref.branchId, value => {
           

            Helper.networkHelperTokenPost(
                Pref.BranchUpdateUrl + value,
                jsonData,
                Pref.methodPut,
                this.state.token,
                result => {
                    this.setState({
                        progressView: false,
                    });
                    //console.log("RESULT",result);
                   //alert('Profile Saved');
                },
                error => {
                    this.setState({ progressView: false, disabled: false });
                }
            );
        });

    }

    fetchLoc(){
        Geolocation.getCurrentPosition(position => {
            const lx = position.coords.latitude + ', ' + position.coords.longitude;
            this.setState({ lat: position.coords.latitude, lon: position.coords.longitude, location: lx })
        }, error => {

        },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
        )
    }

    
    //added
    updateTime =(day,time) => //what day to update + time given
    {
        if(day === 1)
        {
            this.setState({sun:time});
            // console.log("SUNDAY", this.state.sun);
            return;
        }
        if(day === 2)
        {
            this.setState({mon:time});
            return;
        }
        if(day === 3)
        {
            this.setState({tue:time});
            return;
        }
        if(day === 4)
        {
            this.setState({wed:time});
            return;
        }
        if(day === 5)
        {
            this.setState({thur:time});
            return;
        }
        if(day === 6)
        {
            this.setState({fri:time});
            return;
        }
        this.setState({sat:time});
    } 


    getTime = (day) => // this is for displaying time inside this component
    {
        let times;
        switch (day) {
            case 0:
                times = this.state.sun;
                break;
            case 1:
                times = this.state.mon;
                break;
            case 2:
                times = this.state.tue;
                break;
            case 3:
                times = this.state.wed;
                break;
            case 4:
                times = this.state.thur
                break;
            case 5:
                times = this.state.fri;
                break;
            default:
                times = this.state.sat;
                break;
        }
        
        let newtime = times.replace('#','');
        while(newtime.includes('?'))
        {
            newtime = newtime.replace('?',' , ');
        }
        return newtime;
    
    }

    render() {
        //console.log(this.state.sun);
        return (
            <Screen
                style={{
                    backgroundColor: "white",
                }}>
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <NavigationBar
                    styleName="inline no-border"
                    style={
                        {
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
                            }
                        }
                    }
                    leftComponent={<View style={{ marginStart: 12,flexDirection:'row' }}>
                        <TouchableOpacity onPress={() => NavigationAction.goBack()}>
                            <Icon
                                name="arrow-forward"
                                size={32}
                                color="black"
                                style={{
                                    padding: 4,
                                    backgroundColor: "transparent"
                                }}
                            />
                        </TouchableOpacity>
                        <Heading style={{
                            fontSize: 20, color: '#292929',
                            fontFamily: 'Rubik',
                            fontWeight: '700',
                            alignSelf:'center'
                        }}> עריכת פרופיל</Heading>
                    </View>}
                />
                <ScrollView style={{flex:1}} >
                    <View>
                        <View style={{
                            borderRadius: 2,
                            borderColor: '#dedede',
                            borderStyle: 'solid',
                            borderWidth: 1,
                            backgroundColor: '#ffffff',
                            marginHorizontal: sizeWidth(3),
                            marginVertical: sizeHeight(2),
                            flexDirection: 'row',
                            height: 56,
                            alignItem: 'center',
                            alignContents: 'center'
                        }}>
                            
                            <Subtitle style={{
                                fontSize: 14, color: '#292929',
                                fontFamily: 'Rubik',
                                fontWeight: '400',
                                alignSelf: 'center',
                                marginStart: 10,
                            }}>{`מצב עמוס`}</Subtitle>
                            <View style={{
                                alignItem: 'center', justifyContent: 'center', marginStart: 4
                            }}>
                                <Checkbox
                                    status={this.state.hasDelivery === 0 ? 'unchecked' : 'checked'}
                                    onPress={() => this.setState({ hasDelivery: this.state.hasDelivery === 0 ? 1 : 0 })}
                                    style={{
                                        alignSelf: 'center',
                                        backgroundColor: "transparent",
                                    }}
                                    color={'#3daccf'}
                                />
                            </View>
                        </View>
                        <TextInput
                            dense={true}
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"שם העסק"}
                            disabled={this.state.disabled}
                            password={false}
                            onBlur={() => !this.state.firstName}
                            onChangeText={text => {
                                this.setState({ firstName: text });
                            }}
                            value={this.state.firstName}
                            returnKeyType="next"
                            multiline={true}
                            numberOfLines={1}
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        />
                        
                        <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"מספר פלאפון"}
                            disabled={this.state.disabled}
                            value={this.state.mobileNo}
                            password={false}
                            multiline={true}
                            numberOfLines={1}
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        />
                        <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"הודעת העסק"}
                            disabled={this.state.disabled}
                            password={false}
                            //multiline={true}
                            numberOfLines={1}
                            onChangeText={text => {
                                this.setState({ add1: text });
                            }}
                            value={this.state.add1}
                            multiline={true}
                            returnKeyType="next"
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        />
                        <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"כתובת"}
                            disabled={this.state.disabled}
                            password={false}
                            onChangeText={text => {
                                this.setState({ address: text });
                            }}
                            value={this.state.address}
                            returnKeyType="next"
                            multiline={true}
                            numberOfLines={1}
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        />
                        
                        
                        <TouchableWithoutFeedback onPress={() => this.setState({ showWeekDays: !this.state.showWeekDays})}>
                            <View style={{
                                borderRadius: 2,
                                borderColor: '#dedede',
                                borderStyle: 'solid',
                                borderWidth: 1,
                                backgroundColor: '#ffffff',
                                marginHorizontal: sizeWidth(3),
                                marginVertical: sizeHeight(2),
                                flexDirection: 'row',
                                height: 56,
                                alignItem: 'center',
                                justifyContent: 'space-between',
                                alignContents: 'center'
                            }}>
                                <Subtitle style={{
                                    fontSize: 14, color: '#292929',
                                    fontFamily: 'Rubik',
                                    fontWeight: '400',
                                    alignSelf: 'center',
                                    marginHorizontal: 8,
                                }}>{`שעות פתיחה`}</Subtitle>

                                <Icon
                                    name='keyboard-arrow-down'
                                    size={24}
                                    color="#292929"
                                    style={{
                                        marginHorizontal: 8,
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                        backgroundColor: "transparent"
                                    }}
                                />
                            </View>
                        </TouchableWithoutFeedback>

                        {this.state.showWeekDays ? <View>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(1,this.state.sun)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={{
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>
                                        {/* {this.state.sun} */}
                                        {this.getTime(0)}
                                        </Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(2,this.state.mon)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={styles.textDayTime}>{this.getTime(1)}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(3,this.state.tue)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={styles.textDayTime}>{this.getTime(2)}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(4,this.state.wed)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={styles.textDayTime}>{this.getTime(3)}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(5,this.state.thur)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={styles.textDayTime}>{this.getTime(4)}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(6,this.state.fri)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={styles.textDayTime}>{this.getTime(5)}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.handleOnClickDayTimes(7,this.state.sat)}>
                                <View style={styles.containerDayTime}>
                                    <Subtitle style={styles.textDayTime}>{this.getTime(7)}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>:null}

                        {/* //BusinessDelivery */}
                        <TouchableWithoutFeedback onPress={() =>  NavigationAction.navigate('BusinessDelivery')}>
                            <View
                                style={{
                                    alignItem: 'flex-start', justifyContent: 'center', borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 56,borderRadius:2, marginHorizontal: sizeWidth(3),
                                    marginVertical: sizeHeight(2),}}>
                                <Subtitle numberOfLines={1} style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(2) }}>{'משלוח'}</Subtitle>

                            </View>
                        </TouchableWithoutFeedback>
                        
                        <TouchableWithoutFeedback onPress={() => this.onImageClick()}>
                            <View style={styles.containerDayTime}>

                                <Subtitle style={{
                                    fontSize: 14, color: '#292929',
                                    fontFamily: 'Rubik',
                                    fontWeight: '400',
                                    alignSelf: 'center',
                                    marginStart: 10,
                                }}>{this.state.imageName === '' ? `לחץ כדי להעלות לוגו לעסק` : this.state.imageName}</Subtitle>
                            </View>
                        </TouchableWithoutFeedback>
                        
                    </View>
                    
                </ScrollView>
                <View >
                    <Button
                        styleName=" muted border"
                        mode={"contained"}
                        uppercase={true}
                        dark={true}
                        loading={false}
                        style={[styles.loginButtonStyle]}
                        onPress={this.onSaveClick}
                    >
                        <Subtitle
                            style={{
                                color: "white"
                            }}
                        >עדכון </Subtitle>
                    </Button>
                </View>
                <Portal>
                    <Modal
                        onDismiss={() => this.setState({ showdialogtime: false, })}
                        dismissable={true}
                        visible={this.state.showdialogtime}
                        style={{ backgroundColor: 'white' }}>
                        <View
                            style={{
                                borderRadius: 8,
                                backgroundColor: "white",
                                flexDirection: 'column',
                                paddingVertical: 16,
                                marginHorizontal: sizeWidth(10)
                            }}>
                            <View style={{
                                justifyContent: 'center', paddingHorizontal: 8, marginVertical: 8, marginHorizontal: 8,
                            }}>
                                <TouchableWithoutFeedback onPress={() => {
                                    this.setState({ temptimeshow: true, showdialogtime: false })
                                }}>
                                    <Subtitle
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: '#3DACCF',
                                            alignSelf: 'center',
                                            marginBottom: 4,
                                        }}
                                    >
                                        {`בחר שעות פתיחה`}
                                    </Subtitle>
                                </TouchableWithoutFeedback>
                                <TouchableWithoutFeedback onPress={() => {
                                    const { modexx } = this.state;
                                    let sun = `ראשון#`;
                                    let mon =  `שני#`;
                                    let tue = `שלישי#`;
                                    let wed = `רביעי#`;
                                    let thur = `חמישי#`;
                                    let fri = `שישי#`;
                                    let sat = `שבת#`;
                                    const closs = 'סגור';
                                    if (modexx === 1) {
                                        this.setState({ sun: sun+' ' + closs, showdialogtime: false })
                                    } else if (modexx === 2) {
                                        this.setState({ mon: mon + ' ' + closs, showdialogtime: false })
                                    } else if (modexx === 3) {
                                        this.setState({ tue: tue + ' ' + closs, showdialogtime: false })
                                    } else if (modexx === 4) {
                                        this.setState({ wed: wed + ' ' + closs, showdialogtime: false })
                                    } else if (modexx === 5) {
                                        this.setState({ thur: thur + ' ' + closs, showdialogtime: false })
                                    } else if (modexx === 6) {
                                        this.setState({ fri: fri + ' ' + closs, showdialogtime: false })
                                    } else if (modexx === 7) {
                                        this.setState({ sat: sat + ' ' + closs, showdialogtime: false })
                                    }
                                }}>
                                    <Subtitle
                                        style={{
                                            fontSize: 16,
                                            fontWeight: "400",
                                            color: 'red',
                                            paddingHorizontal: 8,
                                            marginHorizontal: 8,
                                            marginTop: 8,
                                            alignSelf: 'center'
                                        }}
                                    >
                                        {`סמן כסגור`}
                                    </Subtitle>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    </Modal>
                </Portal>
                {/** DIALOG OPENING ON PICKING HOURS OR CLOSING ON THAT DAY END  */}
                <Loader 
                    isShow={this.state.progressView}
                />
                {/** DIALOG PICKING HOURS FOR BUSINESS START */}
                {/* <DialogTimePickerDay showModal={this.state.temptimeshow} day={this.state.modexx} times={this.getTimeForDialogPicker(this.state.modexx)} updateTime={this.updateTime} handleShowModal={() => this.setState({temptimeshow: false})} /> */}
                <View>
                <DateTimePicker
                    isVisible={this.state.timePickerShow}
                    onConfirm={this._handleSDatePicked}
                    mode={"time"}
                    is24Hour={true}
                    onCancel={() => this.setState({ timePickerShow: false })}
                />
                <Portal>
                    <Modal
                    dismissable={true}
                    visible={this.state.temptimeshow}
                    onDismiss={() => this.setState({temptimeshow: false})}
                    contentContainerStyle={{
                        marginHorizontal: sizeWidth(4),
                        backgroundColor: 'white',
                    }}>
                    <View style={{ backgroundColor: 'white' }}>
                        <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(1), color: '#292929', fontSize: 16, alignSelf: 'center', fontWeight: 'bold', marginVertical: sizeHeight(1), paddingVertical: sizeHeight(2) }} styleName="bold">
                            {`בחירת שעות`}
                        </Subtitle>
                        <View style={{flexDirection:'row',justifyContent:'center'}}>
                        <Button
                            styleName="muted border"
                            mode={"contained"}
                            uppercase={true}
                            dark={true}
                            onPress={this.addNewTime}
                        >
                            <Subtitle
                                style={{ color: "white" }}>{'הוסף שעת פעילות'}</Subtitle>
                        </Button>
                        </View>
                        <View style={{marginBottom:sizeHeight(1)}}>
                            <FlatList
                            extraData={this.state}
                            showsHorizontalScrollIndicator={false}
                            data={this.state.times}
                            nestedScrollEnabled={true}
                            keyExtractor={(item ,index) => item + index}
                            renderItem={({ item: eachTabData, index }) =>
                                this.renderSingleTimeBox(eachTabData, index)}
                            />
                            </View>
                        <Button
                            styleName=" muted border"
                            mode={"contained"}
                            uppercase={true}
                            dark={true}
                            style={{
                                color: "white",
                                bottom: 0,
                                paddingVertical: sizeHeight(1),
                                marginVertical: sizeHeight(2),
                                marginHorizontal: sizeWidth(1),
                                backgroundColor: '#3daccf',
                                textAlign: "center",
                                margin: 0,
                            }}
                            onPress={this.onSubmitTime}
                        >
                            <Subtitle
                                style={{ color: "white" }}>{'סיום'}</Subtitle>
                        </Button>
                    </View>
                    </Modal>
                </Portal>
                </View>
                
                {/** DIALOG PICKING HOURS FOR BUSINESS END */}
            </Screen>
        );
    }



    renderSingleTimeBox(item,index)
    {
    return(
      <View style={styles.containerListHours}>
        <View style={{flexDirection:'column',flex:1,marginEnd:sizeWidth(2),}}>
          <Subtitle style={{alignSelf:'flex-start'}}>{`פתיחה:`}</Subtitle>
          <TouchableWithoutFeedback onPress={() => this.setState({ timePickerShow: true,timePickerOnOpen:true,IndexClicked:index })}>
            <View style={styles.styleBox}>
                <Subtitle style={{
                  fontSize: 20, color: '#292929',
                  fontFamily: 'Rubik',
                  fontWeight: '400',
                  alignSelf: 'center',
                }}>
                  {this.getTimeForList(index,true)}
                  </Subtitle>
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={{flexDirection:'column',flex:1,}}>
          <Subtitle style={{alignSelf:'flex-start'}}>{`סגירה:`}</Subtitle>
          <TouchableWithoutFeedback onPress={() => this.setState({ timePickerShow: true, timePickerOnOpen: false, IndexClicked:index})}>
            <View style={styles.styleBox}>
              <Subtitle style={{
                  fontSize: 20,
                  color: '#292929',
                  fontFamily: 'Rubik',
                  fontWeight: '400',
                  alignSelf: 'center',
                }}>
                  {this.getTimeForList(index,false)}
                  </Subtitle>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <TouchableWithoutFeedback onPress={() => this.deleteTime(index)}>
          <Image
            source={require('../res/images/delete.png')}
            style={styles.iconTrashStyle}
          />
        </TouchableWithoutFeedback>
      </View>);
    }

    handleOnClickDayTimes = (day,times) =>
    {
        this.setState({ showdialogtime: true,modexx:day});
        let newTime = this.singleDayTimesToarray(times);
        let newDay = this.setUpDay(day);
        //console.log("DAY :", newDay);
        //console.log("HANDLE ON CLICK DAY TIMES FUNC:", times ," NEW TIMES:", newTime);
        this.setState({times:newTime,day:newDay});
    }


    getTimeForList = (index,opening) => //opening = true or false closing
    {
        if(this.state.times.length > index)
        {
            if(opening)                         //   [0]-[1] = ["HH:mm","HH:mm"]
            {        //this.state.times[index] == "HH:mm-HH:mm"
                return this.state.times[index].split('-')[0];
            }
            return this.state.times[index].split('-')[1];
        }
        return '';
    }

    _handleSDatePicked = (date) => {
        const time = Moment(date).format("HH:mm");
        const index = this.state.IndexClicked;
        const openingHour = this.state.timePickerOnOpen;
        let newTimes = [...this.state.times];
        const curTime = newTimes[index];
        let tempTime = curTime.split('-');
        if(openingHour)
        {
          tempTime[0] = time;
        }
        else
        {
          tempTime[1] = time;
        }
        tempTime = tempTime[0] + '-' + tempTime[1];
        newTimes[index] = tempTime;
        this.setState({timePickerShow:false});
        this.handleTimes(newTimes);
      };

    singleDayTimesToarray = (times) =>
    {
        if(times.includes(`סגור`))
        {
            return [];
        }
        if(times === [] || times === null || times === undefined)
        {
            return [];
        }
        var result = [];
        // var regex = /[0-2]{1}[0-4]{1}:[0-5]{1}[0-9]{1} - [0-2]{1}[0-4]{1}:[0-5]{1}[0-9]{1}/g;
        var result = [];
        var result = times.split("#")[1].trim().split("?");
        if(result.length > 1){
            result.map(e=>{var s = e.split("-"); return s[1].trim()+" - "+s[0].trim()});
        }
       
        if(result === null)
            return [];
        var len = result.length;
        for (var i = 0; i < len ; i++ )
        {
            while(result[i].includes(' '))
            {
                result[i] = result[i].replace(' ','');
            }
        }
        return result;
    } 

    addNewTime= () =>
    {
        if(this.state.times.length === 3)
        {
        Alert.alert(
            `שגיאה!`,
            "לא ניתן לשים יותר מ-3 שעות פתיחה ליום אחד",
            [
            { text: "אישור", }
            ],
            { cancelable: false }
        );
        return;
        }
        let temp = this.state.times;
        temp.push(`00:00-06:00`);
        this.handleTimes(temp);
    }

    deleteTime = (index) =>
    {
        let tempTimes = this.state.times;
        if(tempTimes.length === 1)
        {
        this.handleTimes([]);
        }
        else
        {
        tempTimes.splice(index,1);
        this.handleTimes(tempTimes);
        }
    }

    handleTimes = (newTimes) =>
    {
        this.setState({times:newTimes});
    }
    onSubmitTime = () =>{
        let times = this.state.times;
        times = this.sortTimesSD(times);
        if(!this.checkTimesCrossSD(times))
        {
            Alert.alert(
                `שגיאה!`,
                "לא ניתן לשים שעות חופפות",
                [
                  { text: "אישור", }
                ],
                { cancelable: false }
              );
              return;
        }
        let day = this.state.day;
        let newTimes = `${day}`;
        if(times.length === 0)
        {
            newTimes = newTimes+ ` סגור`;
        }
        
        for(let i =0 ; i < times.length; i++)
        {
            if(i === 0 )
            {
            newTimes = newTimes + ' ' + this.addSpace(times[i]);
            }
            else
            {
            newTimes = newTimes + '?' + this.addSpace(times[i]);
            }
        }
        this.updateTime(this.state.modexx,newTimes);//handle update
        this.setState({temptimeshow:false});
    }
    sortTimesSD(ttimes)
    {
        let times = [...ttimes];
        times.sort(function(a,b)// sort by opening hours 
        {
            a = a.split('-');
            b = b.split('-');
            let aHours = a[0].split(':');
            let bHours = b[0].split(':');
            if(aHours[0] > bHours[0])//check hours
            {
                return 1;
            }
            if(bHours[0] > aHours[0])
            {
                return -1;
            }
            if(aHours[1] > bHours[1])//check mins 
            {
                return 1;
            }
            if(bHours[1] > aHours[1])
            {
                return -1;
            }
            return 0;
        });
        let indexesToRemove = [];
        for(let i =0 ; i < times.length; i++)
        {
            let temp = times[i].split('-');
            if(temp[0]===temp[1])
            {
                // indexesToRemove.push(i);
                return ['00:00-23:59'];
            }
        }
        times = times.filter((_,i)=>!indexesToRemove.includes(i));
        // let opening;
        // let closing;
        
        // for(let i = times.length ; i >-1; i--)
        // {
        //     if(i === 0 )// opening and closing are empty so we assign them
        //     {
        //         continue;
        //     }
        //     else
        //     {
        //         let temp = times[i].split('-');
        //         let curOpening = temp[0];
        //         let curClosing = temp[1];
        //         let tt = times[i-1].split('-');
        //         let earlyOpening =tt[0];
        //         let earlierClosing = tt[1];
        //         console.log("PRINTING: INDEX", i);
        //         console.log(curClosing);
        //         console.log(curOpening);
        //         console.log(earlierClosing);
        //         console.log(earlyOpening);
        //         // console.log(times);
        //         if(curOpening === closing)
        //         {
        //             times[i-1]= opening + '-' + curClosing;
        //             times.splice(i,1);
        //             i--;
        //         }
        //         opening = curOpening;
        //         closing = curClosing;
                
        //     }
        // }
        return times;
    }
    checkTimesCrossSD(ttimes)// //in time[1]:  `HH:mm-HH:mm` '15:00-20:00','15:00-20:00'
    {
        let opening;
        let closing;   
        for(let i = 0 ; i < ttimes.length ; i++)
        {
            if(i === 0 )// opening and closing are empty so we assign them
            {
                let temp  = ttimes[i].split('-');
                opening = temp[0].split(':');
                closing = temp[1].split(':');
                if(opening[0] > closing[0])
                {
                    return false;
                }
                else if (opening[0] === closing[0] && opening[1] > closing[1])
                {
                    return false;
                }
            }
            else
            {
                let temp = ttimes[i].split('-');
                let curOpening = temp[0].split(':');
                let curClosing = temp[1].split(':');
                if(curOpening[0] > curClosing[0])//check the acitivity time itself its is correct 15:00-20:00 is good, 20:00-15:00 is bad
                {
                    return false;
                }
                else if (curOpening[0] === curClosing[0] && curOpening[1] > curClosing[1]) // this is if Hours and the same check mins
                {
                    return false;
                }
                if(closing[0] > curOpening[0])
                {
                    return false;
                }
                else if( closing[0] === curOpening[0] && closing[1] > curOpening[1])
                {
                    return false;
                }
                opening = curOpening;
                closing = curClosing;
            }
        }
        return true;
    }
    setUpDay = (day) =>
    {
      if(day === 1)
      {
        return `ראשון#`;
      }
      if(day === 2)
      {
        return `שני#`;
      }
      if(day === 3)
      {
        return `שלישי#`;
      }
      if(day === 4)
      {
        return `רביעי#`;
      }
      if(day === 5)
      {
        return `חמישי#`;
      }
      if(day === 6)
      {
        
        return `שישי#`;
      } 
      if(day === 7)
      {
        return `שבת#`;
      }
    }
    addSpace(str)
    {
        if(str !== null !== undefined)
        {
            if(str.includes('-'))
            {
            var splited = str.split('-');
            return splited[0] + ' - ' + splited[1];
            }
        }
        return str;
    }
}

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
        marginHorizontal:sizeWidth(3),
        marginVertical:sizeHeight(2),
        fontWeight: '700',
    },
    loginButtonStyle: {
        color: "white",
        bottom: 0,
        paddingVertical: 6,
        marginHorizontal:sizeWidth(3),
        marginVertical:sizeHeight(2),
        backgroundColor: '#3daccf',
        textAlign: "center",
        margin: 0,
    }, fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
    styleBox:{
        borderRadius: 2,
        borderColor: '#dedede',
        borderStyle: 'solid',
        borderWidth: 1,
        backgroundColor: '#ffffff',
        height:sizeHeight(6),
         flex: 1,
         justifyContent: 'center',
         alignItems: 'center'
    },
    simpleBorder:{
        borderRadius: 2,
        borderColor: 'black',
        borderWidth: 2,
    },
    iconTrashStyle:{
        width: 20,
        height: 25,
        alignSelf:'center',
        marginStart:sizeWidth(3),
        marginTop:sizeHeight(3),
    },
    addActivityHourButtonStyle: {
        color: "white",
        bottom: 0,
        paddingVertical: 6,
        paddingHorizontal:sizeWidth(2),
        backgroundColor: '#3daccf',
        textAlign: "center",
        margin: 0,
      },
      containerDayTime:{
        borderRadius: 2,
        borderColor: '#dedede',
        borderStyle: 'solid',
        borderWidth: 1,
        backgroundColor: '#ffffff',
        marginHorizontal: sizeWidth(3),
        marginVertical: sizeHeight(2),
        flexDirection: 'row',
        height: 56,
        //alignItem: 'center',
        justifyContent: 'space-between',
        //alignContents: 'center'
    },
    textDayTime:{
        fontSize: 16, color: '#292929',
        fontFamily: 'Rubik',
        fontWeight: '400',
        alignSelf: 'center',
        marginHorizontal: 8,
    },
    containerListHours:
    {
        flexDirection: 'row',
        justifyContent:'space-between',
        flex:1,
        marginHorizontal:sizeWidth(2.5),
        marginVertical:sizeHeight(1)
    },
        
});
