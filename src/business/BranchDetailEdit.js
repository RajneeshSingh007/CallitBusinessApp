import React from "react";
import { ScrollView, StatusBar, StyleSheet, TouchableOpacity, Platform, TouchableWithoutFeedback} from "react-native";
import { Button, Snackbar, FAB, TextInput, Colors, Checkbox, Portal,Modal} from "react-native-paper";
import { NavigationBar, Screen, Title, View,Subtitle,Image,Heading} from "@shoutem/ui";
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
import { AlertDialog} from '../util/AlertDialog';

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
            errorMsg: "",
            progressView: false,
            isEdit:true,
            bid:0,
            lat:'',
            lon:'',
            address:'',
            disabled:false,
            timePick:false,
            dcost:'',
            ddata:null,
            token:'',
            oldcost:'',
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
            temptime1:'',
            temptime2:'',
            temptimeshow:false,
            temp1show:false,
            temp2show: false,
            hasDelivery:0,
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
        //////console.log('imageBase64', data);
        ////console.log('businessHours', sp.length > 0 ? 'ראשון' : 'ראשון ' + sp[0]);
        let sun = 'ראשון';
        let mon = 'שני';
        let tue = 'שלישי';
        let wed = 'רביעי';
        let thur = 'חמישי';
        let fri = 'שישי';
        let sat = 'שבת';

        if (data.businessHours !== undefined && data.businessHours !== null){
            const sp = data.businessHours.split('\n');
            if (sp.length > 0) {
                let agsp = sp[0].split(' ')
                if (sp[0].includes('סגור')) {
                    sun = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    sun = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
            }

            if (sp.length > 1) {
                let agsp = sp[1].split(' ');
                if (sp[1].includes('סגור')) {
                    mon = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    mon = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
            }

            if (sp.length > 2) {
                let agsp = sp[2].split(' ');
                if (sp[2].includes('סגור')) {
                    tue = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    tue = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
            }

            if (sp.length > 3) {
                let agsp = sp[3].split(' ');
                if (sp[3].includes('סגור')) {
                    wed = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    wed = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
            }


            if (sp.length > 4) {
                let agsp = sp[4].split(' ');
                if (sp[4].includes('סגור')) {
                    thur = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    thur = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
            }

            if (sp.length > 5) {
                let agsp = sp[5].split(' ');
                if (sp[5].includes('סגור')) {
                    fri = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    fri = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
            }

            if (sp.length > 6) {
                let agsp = sp[6].split(' ');
                if (sp[6].includes('סגור')) {
                    sat = agsp[0].replace('#', '') + ' ' + agsp[1];
                } else {
                    sat = agsp[0].replace('#', '') + ` ` + agsp[1] + ` - ` + agsp[3];
                }
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
            businessTime:data.businessHours,
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
        this.setState({ progressView: true });
        
        let sp = this.state.sun.split(' ');
        //console.log('sp', sp);
        let fixsp = '';
        if(sp.length > 1){
            fixsp = sp.length === 2 ? sp[0] + '# ' + sp[1] +'                                   ' : sp[0] + '# ' + sp[1]+' - '+sp[3];
        }else{
            fixsp = this.state.sun;
        }
        //console.log('fixsp', fixsp);
        let fixsp1 = '';
        let sp1 = this.state.mon.split(' ');
        if (sp1.length > 1) {
            fixsp1 = sp1.length === 2 ? sp1[0] + '# ' + sp1[1] + '                                   ' : sp1[0] + '# ' + sp1[1] + ' - ' + sp1[3];
        } else {
            fixsp1 = this.state.mon;
        }
        let fixsp2 = '';
        let sp2 = this.state.tue.split(' ');
        if (sp2.length > 1) {
            fixsp2 = sp2.length === 2 ? sp2[0] + '# ' + sp2[1] + '                                   ' : sp2[0] + '# ' + sp2[1] + ' - ' + sp2[3];
        } else {
            fixsp2 = this.state.tue;
        }
        let fixsp3 = '';
        let sp3 = this.state.wed.split(' ');
        if (sp3.length > 1) {
            fixsp3 = sp3.length === 2 ? sp3[0] + '# ' + sp3[1] + '                                   ' : sp3[0] + '# ' + sp3[1] + ' - ' + sp3[3];
        } else {
            fixsp3 = this.state.wed;
        }
        let fixsp4 = '';
        let sp4 = this.state.thur.split(' ');
        if (sp4.length > 1) {
            fixsp4 = sp4.length === 2 ? sp4[0] + '# ' + sp4[1] + '                                   ' : sp4[0] + '# ' + sp4[1] + ' - ' + sp4[3];
        } else {
            fixsp4 = this.state.thur;
        }
        let fixsp5 = '';
        let sp5 = this.state.fri.split(' ');
        if (sp5.length > 1) {
            fixsp5 = sp5.length === 2 ? sp5[0] + '# ' + sp5[1] + '                                   ' : sp5[0] + '# ' + sp5[1] + ' - ' + sp5[3];
        } else {
            fixsp5 = this.state.fri;
        }
        let fixsp6 = '';
        let sp6 = this.state.sat.split(' ');
        if (sp6.length > 1) {
            fixsp6 = sp6.length === 2 ? sp6[0] + '# ' + sp6[1] + '                                   ' : sp6[0] + '# ' + sp6[1] + ' - ' + sp6[3];
        } else {
            fixsp6 = this.state.sat;
        }
        let businessTime = `${fixsp}\n${fixsp1}\n${fixsp2}\n${fixsp3}\n${fixsp4}\n${fixsp5}\n${fixsp6}`;

        //console.log('businessTime', this.state.hasDelivery)

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
            //console.log('value', value);
            // if (this.state.oldcost !== this.state.dcost){
            //     const fd = JSON.stringify({
            //         "iddeliveryPrice": this.state.ddata.iddeliveryPrice,
            //         "branchfk": value,
            //         "lon": this.state.ddata.lon,
            //         "lat": this.state.ddata.lat,
            //         "price": this.state.dcost,
            //         "branchfkNavigation": null
            //     });
            //     Helper.networkHelperTokenPost(
            //         Pref.UpdateDeliveryUrl + value,
            //         fd,
            //         Pref.methodPut,
            //         this.state.token,
            //         result => {
            //             //////console.log(result);
            //         },
            //         error => {
            //         }
            //     );
            // }

            Helper.networkHelperTokenPost(
                Pref.BranchUpdateUrl + value,
                jsonData,
                Pref.methodPut,
                this.state.token,
                result => {
                    this.setState({
                        progressView: false,
                    });
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

    _handleSDatePicked = (date) => {
        const time = Moment(date).format("HH:mm");
        if(this.state.temp1show){
            this.setState({temp1show : false, temptime1:time,timePick:false});
        }
        if (this.state.temp2show) {
            this.setState({ temp2show: false, temptime2: time, timePick: false});
        }
        // this.setState({
        //     businessTime: time,
        //     timePick: false
        // });
    };

    onSubmitTime = () =>{
        const { modexx } = this.state;
        if(this.state.temptime1 !== '' && this.state.temptime2 !== ''){
            let time = this.state.temptime1 + ' - ' + this.state.temptime2;
            let sun = 'ראשון';
            let mon = 'שני';
            let tue = 'שלישי';
            let wed = 'רביעי';
            let thur = 'חמישי';
            let fri = 'שישי';
            let sat = 'שבת';

            if (modexx === 1) {
                this.setState({ sun: this.state.sun.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            } else if (modexx === 2) {
                this.setState({ mon: this.state.mon.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            } else if (modexx === 3) {
                this.setState({ tue: this.state.tue.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            } else if (modexx === 4) {
                this.setState({ wed: this.state.wed.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            } else if (modexx === 5) {
                this.setState({ thur: this.state.thur.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            } else if (modexx === 6) {
                this.setState({ fri: this.state.fri.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            } else if (modexx === 7) {
                this.setState({ sat: this.state.sat.replace('סגור', '').split(' ')[0] + ' ' + time, timePick: false, temptime1: '', temptime2: '', temptimeshow: false })
            }
        }
    }

    render() {
        return (
            <Screen
                style={{
                    backgroundColor: "white"
                }}
            >
                <StatusBar barStyle="dark-content" backgroundColor="white" />
                <NavigationBar
                    styleName="inline no-border"
                    // rightComponent={
                    //     <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
                    //         <Image source={require('./../res/images/menu.png')}
                    //             style={{ width: 24, height: 24, }}
                    //         />

                    //     </View>
                    // }
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
                <ScrollView>
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
                            numberOfLines={1}
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        />
                        {/* <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"תקציר"}
                            disabled={this.state.disabled}
                            password={false}
                            onChangeText={text => {
                                this.setState({ lastName: text });
                            }}
                            value={this.state.lastName}
                            returnKeyType="next"
                            numberOfLines={1}
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        /> */}
                        <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"מספר פלאפון"}
                            disabled={this.state.disabled}
                            value={this.state.mobileNo}
                            password={false}
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
                            numberOfLines={1}
                            onChangeText={text => {
                                this.setState({ add1: text });
                            }}
                            value={this.state.add1}
                            multiline={false}
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
                            numberOfLines={1}
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        />
                        {/* <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"שעות פתיחה"}
                            disabled={this.state.disabled}
                            onFocus={() => this.setState({ timePick: true })}
                            password={false}
                            numberOfLines={1}
                            value={this.state.businessTime}
                            onChangeText={text => {
                                this.setState({ businessTime: text });
                            }}
                            multiline={false}
                            returnKeyType="next"
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        /> */}
                        
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
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 1 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.sun}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 2 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.mon}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 3 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.tue}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 4 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.wed}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 5 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.thur}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 6 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.fri}</Subtitle>
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={() => this.setState({ showdialogtime: true, modexx: 7 })}>
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
                                        fontSize: 16, color: '#292929',
                                        fontFamily: 'Rubik',
                                        fontWeight: '400',
                                        alignSelf: 'center',
                                        marginHorizontal: 8,
                                    }}>{this.state.sat}</Subtitle>
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
                        {/* <TextInput
                            style={styles.inputStyle}
                            mode={"flat"}
                            label={"משלוח"}
                            disabled={this.state.disabled}
                            password={false}
                            numberOfLines={1}
                            value={this.state.dcost}
                            onChangeText={text => {
                                this.setState({ dcost: text });
                            }}
                            multiline={false}
                            returnKeyType="next"
                            underlineColor={"transparent"}
                            underlineColorAndroid={"transparent"}
                        /> */}
                        <TouchableWithoutFeedback onPress={() => this.onImageClick()}>
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
                                }}>{this.state.imageName === '' ? `לחץ כדי להעלות לוגו לעסק` : this.state.imageName}</Subtitle>
                            </View>
                        </TouchableWithoutFeedback>
                        
                        {/* <TextInput
                                style={styles.inputStyle}
                                mode={"flat"}
                                label={"לוגו"}
                                password={false}
                                placeholder={'לחץ כדי להעלות לוגו לעסק'}
                                returnKeyType="next"
                                numberOfLines={1}
                                editable={false}
                                value={this.state.imageName}
                                underlineColor={"transparent"}
                                underlineColorAndroid={"transparent"}
                                caretHidden={true}
                                onFocus={this.onImageClick}
                            /> */}
                        {/* <TextInput
                                style={styles.inputStyle}
                                mode={"flat"}
                                disabled={this.state.disabled}
                                label={"Location"}
                                password={false}
                                value={this.state.location}
                                returnKeyType="done"
                                numberOfLines={1}
                                underlineColor={"transparent"}
                                underlineColorAndroid={"transparent"}
                            /> */}
                        {/* <View styleName="horizontal v-start h-start" style={{marginStart:4,}}>
                                <Subtitle
                                    styleName="v-center h-center"
                                    style={{alignSelf:'center', marginStart:4,}}
                                >

                                    delivery
                                </Subtitle>
                                <Checkbox
                                    status={
                                        this.state.delivery == 1
                                            ? "checked"
                                            : "unchecked"
                                    }
                                    onPress={() =>{if(!this.state.disabled){
                                        this.setState({
                                            delivery:
                                                this.state.delivery === 0 ||
                                                    this.state.delivery === 2
                                                    ? 1
                                                    : 0
                                        })
                                    }}                                  
                                  }
                                />
                            </View> */}
                    </View>
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

                </ScrollView>
                <DateTimePicker
                    isVisible={this.state.timePick}
                    onConfirm={this._handleSDatePicked}
                    mode={"time"}
                    is24Hour={true}
                    onCancel={() => this.setState({ timePick: false })}
                />
                <Portal>

                    <Modal
                        onDismiss={() => this.setState({ showdialogtime: false, })}
                        dismissable={true}
                        visible={this.state.showdialogtime}
                        style={{ backgroundColor: 'white' }}
                    >
                        <View
                            style={{
                                borderRadius: 8,
                                backgroundColor: "white",
                                flexDirection: 'column',
                                paddingVertical: 16,
                                marginHorizontal: sizeWidth(10)
                            }}
                        >
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
                                    let sun = 'ראשון';
                                    let mon = 'שני';
                                    let tue = 'שלישי';
                                    let wed = 'רביעי';
                                    let thur = 'חמישי';
                                    let fri = 'שישי';
                                    let sat = 'שבת';
                                    const closs = 'סגור';
                                    if (modexx === 1) {
                                        this.setState({ sun: sun+' '+closs, showdialogtime: false })
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
                <Loader 
                    isShow={this.state.progressView}
                />
                <Portal>
                    <Modal
                        dismissable={true}
                        visible={this.state.temptimeshow}
                        onDismiss={() => this.setState({ temptimeshow: false })}
                        contentContainerStyle={{
                            marginHorizontal: sizeWidth(4),
                            backgroundColor: 'white',
                        }}>
                        <View styleName="vertical" style={{ backgroundColor: 'white' }}>
                            <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(1), color: '#292929', fontSize: 16, alignSelf: 'center', fontWeight: 'bold', marginVertical: sizeHeight(1), paddingVertical: sizeHeight(2) }} styleName="bold">
                                {`בחירת שעות`}
                            </Subtitle>
                            <View style={{ flexDirection: 'row', }}>
                                <TouchableWithoutFeedback onPress={() => this.setState({ timePick: true, temp2show:false,temp1show: true, })}>
                                    <View style={{
                                        borderRadius: 2,
                                        borderColor: '#dedede',
                                        borderStyle: 'solid',
                                        borderWidth: 1,
                                        backgroundColor: '#ffffff',
                                        marginHorizontal: sizeWidth(3),
                                        marginVertical: sizeHeight(2),
                                        flexDirection: 'row',
                                        flex:0.5,
                                        height:56,
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
                                        }}>{this.state.temptime1 === '' ? `שעת פתיחה` : this.state.temptime1}</Subtitle>
                                    </View>
                                </TouchableWithoutFeedback>

                                <TouchableWithoutFeedback onPress={() => this.setState({ timePick: true, temp1show: false, temp2show:true})}>
                                    <View style={{
                                        flex: 0.5,
                                        height: 56,
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
                                        }}>{this.state.temptime2 === '' ? `שעת סגירה` : this.state.temptime2}</Subtitle>
                                    </View>
                                </TouchableWithoutFeedback>
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
                                onPress={() => this.onSubmitTime()}
                            >
                                <Subtitle
                                    style={{ color: "white" }}>{'סיום'}</Subtitle>
                            </Button>
                        </View>
                    </Modal>
                </Portal>
            </Screen>
        );
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
});
