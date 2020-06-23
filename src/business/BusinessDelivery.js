import React from "react";
import { FlatList, StatusBar, StyleSheet, Image, TouchableWithoutFeedback, BackHandler, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Divider, Title, Heading, NavigationBar, Row, Screen, Subtitle, TouchableOpacity, View } from "@shoutem/ui";
import { Chip, Button, Checkbox, Colors, Dialog, Modal, FAB, Portal, Snackbar, TextInput, Avatar } from "react-native-paper";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import { Loader } from "./../customer/Loader";
import NavigationAction from '../util/NavigationActions';
import { sizeWidth, sizeHeight } from "../util/Size";
import * as Lodash from 'lodash';
import BusinessMenuChoices from "./BusinessMenuChoices";
import { AlertDialog } from './../util/AlertDialog';
import DummyLoader from "../util/DummyLoader";

export default class BusinessDelivery extends React.Component {
    constructor(props) {
        super(props);
        this.renderRow = this.renderRow.bind(this);
        this.renderRowSuggestion = this.renderRowSuggestion.bind(this);
        this.backClick = this.backClick.bind(this);
        this.scrollingRef = React.createRef();
        this.bottomRef = React.createRef();
        this.onlayout = this.onlayout.bind(this);
        this.inputRef = React.createRef();
        this.inlayout = this.inlayout.bind(this);
        this.state = {
            token: '',
            bId: null,
            progressView: false,
            smp: false,
            categoryList: [],
            selectedOptions: "",
            hideView: false,
            extraName: "",
            message: "",
            multi: false,
            extraNameOpt: "",
            extraPrice: "",
            tempData: [],
            dialogShow: false,
            tempName: "",
            extraNameOptd: "",
            extraPriced: "",
            showCat: false,
            extraMode: false,
            extraCatId: 0,
            extraSingle: 0,
            title: "",
            tempData1: [],
            scrollX: 0,
            scrollY: 0,
            showdeletex: false,
            showAlert: false,
            alertContent: '',
            citiesList:[],
            deliveryList:[],
            suggestionsListCities:[],
            tempinputdata:null,
            branchId:0
        };
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", this.backClick);
        this.fetchAllExtraCat();
    }

    backClick() {
        NavigationAction.goBack();
        return true;
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", this.backClick);
    }

    fetchAllExtraCat() {
        this.setState({ progressView: true, });
        // Pref.setVal(Pref.branchId, value => {
        //     //console.log('branchId', value);
        //     this.setState({ branchId: Helper.removeQuotes(value) });
        // });
        Pref.getVal(Pref.bBearerToken, value => {
            const removeQuotes = Helper.removeQuotes(value);
            this.setState({ token: removeQuotes });
            ////console.log('token', this.state.token);
            Pref.getVal(Pref.branchId, v => {
                this.setState({ bId: v });
                ////console.log('v', v);
                Helper.networkHelperToken(
                    Pref.GetDeliveryListItemUrl + v,
                    Pref.methodGet,
                    removeQuotes,
                    result => {
                        const value = result.map(ele => {
                            ele.new = false;
                            return ele;
                        });
                        ////console.log('datalist', value);
                        this.setState({ tempData: value, progressView: false,smp:false });
                    },
                    error => {
                        this.setState({ progressView: false });
                    }
                );
            });
            Helper.networkHelperToken(
                Pref.Cities,
                Pref.methodGet,
                removeQuotes,
                result => {
                    const allcities = result;
                    this.setState({ citiesList: allcities, });
                },
                error => {
                }
            );
        });
    }

    /**
     *
     * Add extra
     */
    addExtra() {
        this.setState({ smp: true });
        const addpart = Lodash.map(this.state.tempData, (ele) =>{
            if(ele.new){
                return ele.delivery;
            }
        });
        const updatepart = Lodash.map(this.state.tempData, (ele) =>{
            if(!ele.new){
                return ele.delivery;
            }
        });
        const filteradd = addpart.filter(ele => {
            return ele !== undefined;
        });
        const filterupdate = updatepart.filter(ele => {
            return ele !== undefined;
        });
        ////console.log('up', filterupdate);
        ////console.log('add', filteradd);
        const addpartStringify = JSON.stringify(filteradd);
        const promises = [];
        const ok = filterupdate.map(ele =>{
            if(ele !== undefined){
                const updateStringify = JSON.stringify(ele);
                const pp = fetch(Pref.UpdateDeliveryUrl + ele.iddeliveryPrice, {
                    method: Pref.methodPut,
                    headers: {
                        Authorization: "Bearer " + this.state.token,
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: updateStringify
                });
                promises.push(pp);
            }
        });
        const pp = fetch(Pref.AddDeliveryPrices, {
            method: Pref.methodPut,
            headers: {
                Authorization: "Bearer " + this.state.token,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: addpartStringify
        });
        promises.push(pp);
        Promise.all(promises).then(arrOfResults => {
            alert('עודכן בהצלחה');
            this.fetchAllExtraCat();
        });
    }

    onlayout(event) {
        var { x, y, width, height } = event.nativeEvent.layout;
        const hx = this.state.scrollX + x;
        const ly = this.state.scrollY + y;
        this.setState({ scrollX: hx, scrollY: ly });
    }

    inlayout(event) {
        var { x, y, width, height } = event.nativeEvent.layout;
        const hx = this.state.scrollX + x;
        const ly = this.state.scrollY + y;
        this.setState({ scrollX: hx, scrollY: ly });
    }

    /**
     * add extra items
     */
    addExtraOptions() {
        if (this.state.extraNameOpt !== "" && this.state.extraPrice !== "") {
            const cloned = this.state.tempData;
            const ooo = this.state.tempinputdata;
            ooo.delivery.price = Number(this.state.extraPrice);
            ooo.delivery.branchfk = Number(this.state.bId);
            cloned.push(ooo);
            if (this.scrollingRef !== undefined) {
                //////console.log('x:y', this.state.scrollX + " " + this.state.scrollY);
                this.scrollingRef.scrollTo({ x: this.state.scrollX, y: this.state.scrollY, animated: true });
            }
            this.setState({
                tempinputdata:null,
                tempData: cloned,
                hideView: false,
                extraNameOpt: "",
                extraPrice: "",
                scrollX: 0,
                scrollY: 0
            });
        } else {
            this.setState({ message: "נא להוסיף עיר" });
        }
    }

    _showDialog = () => this.setState({ dialogShow: true });

    _hideDialog = () => this.setState({ dialogShow: false });

    editItems(datasss) {
        const name = datasss.cityName;
        const price = datasss.delivery.price;
        //////console.log('price', price);
        this.setState({
            hideView: false,
            extraNameOptd: name,
            extraPriced: price,
            tempName: name,
            dialogShow: true
        });
    }

    editSave() {
        const cloned = this.state.tempData;
        const op = this.state.tempName;
       // const newName = this.state.extraNameOptd;
        const newPrice = this.state.extraPriced;
        // const doom = cloned.some(function (obj) {
        //     if (obj.cityName === op) {
        //         obj.delivery.price = newPrice;
        //         return true;
        //     }
        // });
        const cloned1 = Lodash.map(cloned, (obj)=>{
            if (obj.cityName === op) {
                obj.delivery.price = newPrice;
            }
            return obj;
        })
        this.setState({
            tempData: cloned1,
            hideView: false,
            extraNameOptd: "",
            extraPriced: "",
            tempName: "",
            dialogShow: false,
        });
    }

    /**
   * deleteExtras
   */
    deleteExtras(indexx, datass) {
        if (datass.new){
            const ooo = this.state.tempData[indexx];
            const cloned = this.state.tempData;
            cloned.splice(indexx);
            this.setState({ tempData: cloned });
        }else{
            this.setState({ showdeletex: true }, () => {
                if (this.state.showdeletex) {
                    Alert.alert(
                        'מחיקה',
                        'האם אתה בטוח?',
                        [
                            {
                                text: 'לא', onPress: () => { this.setState({ showdeletex: false }) }
                            },
                            {
                                text: 'כן', onPress: () => {
                                    const idx = datass.delivery.iddeliveryPrice;
                                    this.setState({ smp: true });
                                    ////console.log('postData', idx);
                                    const ppxx = fetch(Pref.DeleteDeliveryPrices+idx, {
                                        method: Pref.methodPost,
                                        headers: {
                                            Authorization: "Bearer " + this.state.token,
                                            Accept: "application/json",
                                            "Content-Type": "application/json"
                                        },
                                    })
                                    .then(response => response.json())
                                    .then(result =>{
                                        ////console.log(result);
                                        const cloned = Lodash.filter(this.state.tempData, (ele) => {
                                            return ele.delivery.iddeliveryPrice !== idx;
                                        });
                                        this.setState({ smp: false, tempData: cloned, showdeletex: false });
                                    }).catch(error =>{
                                        this.setState({ smp: false, showdeletex: false });
                                    });
                                }
                            }
                        ]
                    );
                }
            });
        }
    }


    sugg = (content) =>{
        this.setState({ extraNameOpt: content });
        if(content !== ''){
            Helper.networkHelperTokenPost(
                Pref.GetDeliveryListItemAutoCompleteSearchUrl,
                JSON.stringify({
                    input: content
                }),
                Pref.methodPost,
                this.state.token,
                result => {
                   // //console.log('datalist', result);
                    this.setState({ suggestionsListCities: result });
                },
                error => {
                }
            );
        }
    }

    temprow = (rowData) =>{
       const temppp = {
            cityName:rowData.name,
            delivery:{
                lat:rowData.lat,
                lon:rowData.lon,
            },
            new:true
       };
        this.setState({ extraNameOpt: rowData.name, tempinputdata: temppp,suggestionsListCities:[] });
    }

    /**
 *
 * @param {*} rowData
 * @param {*} index
 */
    renderRowSuggestion(rowData, index) {
        return (
            <Row style={{ flexDirection: 'column', marginHorizontal: -8, marginVertical: -6 }}>
                <TouchableWithoutFeedback onPress={() => this.temprow(rowData)}>
                    <View styleName="horizontal space-between" style={{ width: '100%' }}>
                        <Subtitle numberOfLines={1} style={{ color: '#292929', fontSize: 16,}}>{rowData.name}</Subtitle>
                    </View>
                </TouchableWithoutFeedback>
            </Row>
        );
    }

    /**
     *
     * @param {*} rowData
     * @param {*} index
     */
    renderRow(rowData, index) {
        return (
            <Row style={{ flexDirection: 'column', marginHorizontal: -8, marginVertical: -6 }}>
                <View styleName="horizontal space-between" style={{ width: '100%' }}>
                    <Subtitle numberOfLines={1} style={{ color: '#292929', fontSize: 16, fontWeight: 'bold' }}>{}</Subtitle>
                    <TouchableWithoutFeedback onPress={() => this.deleteExtras(index, rowData)}>
                        <Image
                            source={require('../res/images/delete.png')}
                            style={{ width: 14, height: 17, marginStart: sizeWidth(4), }}
                        />
                    </TouchableWithoutFeedback>

                </View>

                <View styleName="horizontal" style={{ marginTop: sizeHeight(1) }}>
                    <View
                        style={{ alignItem: 'flex-start', flex: 0.5, justifyContent: 'center', borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 48, marginEnd: sizeWidth(1) }}>
                        <Subtitle numberOfLines={1} style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(2) }}>{rowData.cityName}</Subtitle>

                    </View>
                    <TouchableWithoutFeedback onPress={() => this.editItems(rowData)}>
                        <View
                            style={{ alignItem: 'flex-start', flex: 0.5, justifyContent: 'center', borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 48, }}>
                            <Subtitle
                                numberOfLines={1}
                                styleName="bold"
                                style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(2), fontWeight: '700' }}>
                                ₪{rowData.delivery.price}
                            </Subtitle>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Row>
        );
    }

    renderCatRow(rowData, index) {
        return (
            <TouchableOpacity
                onPress={() =>
                    this.setState({
                        extraName: rowData.name,
                        showCat: false,
                        extraCatId: rowData.idcategory,
                        extraSingle: rowData.single
                    })
                }
            >
                <View style={{ alignItem: 'flex-start', justifyContent: 'flex-start', alignSelf: 'flex-start', alignContent: 'flex-start', marginVertical: sizeHeight(1), marginHorizontal: sizeWidth(2), padding: 4 }}>
                    <Subtitle
                        styleName="bold"
                        style={{
                            fontFamily: 'Rubik',
                            fontSize: 16,
                            fontWeight: '400',
                            alignSelf: "center",
                            color: '#292929',
                        }}
                    >
                        {Lodash.capitalize(rowData.name)}</Subtitle>
                </View>
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <Screen
                style={{
                    backgroundColor: "white"
                }}
            >
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <NavigationBar
                    styleName="inline no-border"
            //         rightComponent={
            //             <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
            //                 {/* <TouchableOpacity onPress={() => { }}>
            //     <Image source={require('./../res/images/search.png')}
            //       onPress={() => this.onnScreen()}
            //       style={{ width: 24, height: 24, marginEnd: 16, }}
            //     />
            //   </TouchableOpacity> */}
            //                 <BusinessMenuChoices />
            //             </View>
            //         }
                    leftComponent={<View style={{ marginStart: 12, flexDirection: 'row', }}>
                        <TouchableOpacity onPress={() => NavigationAction.goBack()}>
                            <Icon
                                name="arrow-forward"
                                size={28}
                                style={{ marginEnd: 12, alignSelf: 'center', }}
                            />
                        </TouchableOpacity>
                        <Heading style={{
                            fontSize: 20, color: '#292929',
                            fontFamily: 'Rubik',
                            fontWeight: '700',
                            alignSelf: 'center'
                        }}>{'משלוחים'}</Heading>
                    </View>}
                />
                <View styleName="vertical" style={{ flex: 1, }}>
                    <DummyLoader
                        visibilty={this.state.progressView}
                        center={
                            <ScrollView showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}
                                ref={(ref) => { this.scrollingRef = ref }}>
                                <View styleName="vertical sm-gutter" style={{ marginHorizontal: sizeWidth(2), }}>
                                    <View style={{ marginTop: sizeHeight(1), }}>
                                        {this.state.tempData.length > 0 ? (
                                            <FlatList
                                                extraData={this.state}
                                                data={this.state.tempData}
                                                keyExtractor={(item, index) => item.name}
                                                showsHorizontalScrollIndicator={false}
                                                showsVerticalScrollIndicator={true}
                                                renderItem={({ item: item, index }) => this.renderRow(item, index)}
                                            />
                                        ) : null}
                                        <View styleName="horizontal sm-gutter" onLayout={(event) => this.inlayout(event)} ref={(ref) => { this.inputRef = ref }}>
                                            <TextInput
                                                style={[styles.inputStyle, { marginEnd: sizeWidth(1), flex: 1 }]}
                                                mode={"flat"}
                                                label={"שם עיר"}
                                                password={false}
                                                returnKeyType="next"
                                                numberOfLines={1}
                                                value={this.state.extraNameOpt}
                                                onChangeText={text => this.sugg(text)}
                                                underlineColor={"transparent"}
                                                underlineColorAndroid={"transparent"}
                                            />


                                            <TextInput
                                                style={[styles.inputStyle, { flex: 1, marginStart: sizeWidth(1) }]}
                                                mode={"flat"}
                                                label={"עלות משלוח"}
                                                password={false}
                                                returnKeyType="done"
                                                numberOfLines={1}
                                                keyboardType={'number-pad'}
                                                value={this.state.extraPrice}
                                                onChangeText={text => this.setState({ extraPrice: text })}
                                                underlineColor={"transparent"}
                                                underlineColorAndroid={"transparent"}
                                            />
                                        </View>
                                        {this.state.suggestionsListCities.length > 0 ? <FlatList
                                            extraData={this.state}
                                            data={this.state.suggestionsListCities}
                                            keyExtractor={(item, index) => item.name}
                                            showsHorizontalScrollIndicator={false}
                                            showsVerticalScrollIndicator={true}
                                            renderItem={({ item: item, index }) => this.renderRowSuggestion(item, index)}
                                        /> : null}

                                        <View style={{
                                            width: '100%',
                                            backgroundColor: '#d9d9d9',
                                            marginVertical: sizeHeight(2),
                                            height: 1,
                                        }} />
                                        <TouchableWithoutFeedback onPress={() => this.addExtraOptions()}>
                                            <View
                                                style={{ borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 60, marginHorizontal: sizeWidth(1), marginTop: sizeHeight(1), justifyContent: 'space-between', flexDirection: 'row-reverse' }} onLayout={(event) => this.onlayout(event)} ref={(ref) => { this.bottomRef = ref }}>
                                                <Icon name={'add'} size={24} style={{ color: '#292929', alignSelf: 'center', marginHorizontal: sizeWidth(2) }} />
                                                <Subtitle style={{ color: '#292929', fontSize: 14, alignSelf: 'center', marginHorizontal: sizeWidth(2) }}>{`הוסף עיר למשלוחים`}</Subtitle>
                                            </View>
                                        </TouchableWithoutFeedback>

                                    </View>
                                </View>
                            </ScrollView>
                        }
                    />
                    <Button
                        styleName=" muted border"
                        mode={"flat"}
                        uppercase={true}
                        dark={true}
                        style={[styles.loginButtonStyle, { position: "relative", bottom: 0, }]}
                        onPress={() => this.addExtra()}
                    >
                        <Subtitle
                            style={{ color: "white" }}>{'עדכון'}
                        </Subtitle>
                    </Button>
                </View>

                <Portal>
                    <Modal dismissable={true} visible={this.state.dialogShow} onDismiss={this._hideDialog}>
                        <View styleName="vertical sm-gutter" style={{ backgroundColor: 'white', marginHorizontal: sizeWidth(8) }}>
                            <Title style={{
                                fontSize: 16,
                                color: '#292929',
                                fontFamily: 'Rubik',
                                fontWeight: '700',
                                alignSelf: 'center',
                                marginVertical: sizeHeight(1),
                                paddingVertical: 8,
                            }}>{`הוספת עיר משלוח`}</Title>
                            <TextInput
                                style={{
                                    backgroundColor: "white",
                                    marginBottom: 6,
                                    marginTop: 6,
                                    borderWidth: 1,
                                    borderBottomEndRadius: 4,
                                    borderBottomLeftRadius: 4,
                                    borderBottomRightRadius: 4,
                                    borderBottomStartRadius: 4,
                                    borderTopEndRadius: 4,
                                    borderTopLeftRadius: 4,
                                    borderTopRightRadius: 4,
                                    borderTopStartRadius: 4,
                                    borderColor: "#eeeeee"
                                }}
                                mode={"flat"}
                                label={"עיר"}
                                password={false}
                                returnKeyType="next"
                                numberOfLines={1}
                                value={this.state.extraNameOptd}
                                onChangeText={text =>
                                    this.setState({ extraNameOptd: text })
                                }
                                disabled={true}
                                underlineColor={"transparent"}
                                underlineColorAndroid={"transparent"}
                            />

                            <TextInput
                                style={{
                                    backgroundColor: "white",
                                    marginBottom: 6,
                                    marginTop: 6,
                                    borderWidth: 1,
                                    borderBottomEndRadius: 4,
                                    borderBottomLeftRadius: 4,
                                    borderBottomRightRadius: 4,
                                    borderBottomStartRadius: 4,
                                    borderTopEndRadius: 4,
                                    borderTopLeftRadius: 4,
                                    borderTopRightRadius: 4,
                                    borderTopStartRadius: 4,
                                    borderColor: "#eeeeee"
                                }}
                                mode={"flat"}
                                label={"עלות"}
                                password={false}
                                returnKeyType="done"
                                numberOfLines={1}
                                keyboardType={"numeric"}
                                value={this.state.extraPriced}
                                onChangeText={text => this.setState({ extraPriced: text })}
                                underlineColor={"transparent"}
                                underlineColorAndroid={"transparent"}
                            />

                            <Button
                                mode={"contained"}
                                style={[styles.loginButtonStyle, { marginVertical: sizeHeight(1) }]}
                                onPress={() => this.editSave()}
                            >
                                <Subtitle
                                    styleName="v-center h-center"
                                    style={{
                                        color: "white"
                                    }}
                                >
                                    {`שמירה`}
                                </Subtitle>
                            </Button>
                        </View>

                    </Modal>
                </Portal>
                {this.state.showAlert ? <AlertDialog isShow={true} title={'שגיאה'} content={this.state.alertContent} callbacks={() => this.setState({ showAlert: false })} /> : null}
                <Loader isShow={this.state.smp} />
                <Snackbar
                    visible={this.state.message === "" ? false : true}
                    duration={1000}
                    onDismiss={() => this.setState({ message: "" })}
                >
                    {this.state.message}
                </Snackbar>
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
        fontWeight: '700',
    },
    buttonStyle: {
        flexGrow: 1,
        marginTop: 8,
        padding: 6,
        backgroundColor: Colors.red500,
        textAlign: "center"
    },
    fab: {
        position: "absolute",
        bottom: 0,
        alignSelf: "center",
        marginBottom: 6,
        backgroundColor: Colors.red500
    },
    loginButtonStyle: {
        color: "white",
        bottom: 0,
        paddingVertical: 6,
        width: '100%',
        backgroundColor: '#3daccf',
        textAlign: "center",
        margin: 0,
    },
});
