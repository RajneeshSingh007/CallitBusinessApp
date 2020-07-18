import React from "react";
import { FlatList, StatusBar, StyleSheet, Image, TouchableWithoutFeedback,BackHandler,ScrollView,Alert} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Divider, Title, Heading, NavigationBar, Row, Screen, Subtitle, TouchableOpacity, View } from "@shoutem/ui";
import {Chip, Button, Checkbox, Colors,Modal, Portal, Snackbar, TextInput} from "react-native-paper";
import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import { Loader } from "./../customer/Loader";
import NavigationAction from "./../util/NavigationActions";
import { sizeWidth, sizeHeight } from "../util/Size";
import * as Lodash from 'lodash';
import NavigationActions from "./../util/NavigationActions";
import BusinessMenuChoices from "./BusinessMenuChoices";
import { AlertDialog } from './../util/AlertDialog';

export default class BusinessEditAddExtra extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.backClick = this.backClick.bind(this);
    this.scrollingRef = React.createRef();
    this.bottomRef = React.createRef();
    this.onlayout = this.onlayout.bind(this);
    this.inputRef = React.createRef();
    this.inlayout = this.inlayout.bind(this);
    this.state = {
      token:'',
      bId:null,
      progressView: false,
      smp:false,
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
      title:"",
      tempData1:[],
      scrollX:0,
      scrollY:0,
      showdeletex:false,
      showAlert: false,
      alertContent: '',
      //added
      minSelect:0,
      maxSelect:0,
    };
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.backClick);
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      Pref.getVal(Pref.bBearerToken, value => {
        const removeQuotes = Helper.removeQuotes(value);
        this.setState({ token: removeQuotes });
        Pref.getVal(Pref.bId, v => {
          this.setState({ bId: v }, () =>{
            this.fetchAllExtraCat();
          });
        })

      });
    });
  }

  backClick(){
    NavigationAction.goBack();
    return true;
  }

  componentWillUnmount(){
    BackHandler.removeEventListener("hardwareBackPress", this.backClick);
    if (this.focusListener !== undefined) { this.focusListener.remove(); }
  }

  fetchAllExtraCat() {
    const {state} = this.props.navigation;
    const itemData = state.params.extraMode;
    const datax = state.params.datax;
    ////console.log('datax', datax);
    const yyyy = state.params.name;
    this.setState({progressView:true, extraMode: itemData, tempData: datax, extraName: yyyy});
    if(itemData === false){
      Helper.networkHelperToken(
        Pref.ExtraCatUrl,
        Pref.methodGet,
        this.state.token,
        result => {
          ////console.log('cat', result);
          this.setState({ categoryList: result, progressView: false });
        },
        error => {
          this.setState({ progressView: false });
        }
      );
    }else{
      Helper.networkHelperToken(
        Pref.ExtraCatUrl,
        Pref.methodGet,
        this.state.token,
        result => {
          //console.log('catx', result);
          let idxx = 0;
          //added
          let minSelect = -1;
          let maxSelect = -1;
          //
          Lodash.map(result, (ele) => {
            if (ele.name == yyyy) {
              idxx = ele.idcategory;
              //console.log('elem', ele);
              minSelect = ele.mustSelect;
              maxSelect = ele.single;
            }
          });
          
          //added
          this.setMinNMaxSelect(minSelect, maxSelect);
          //
          this.setState({ extraCatId: idxx, progressView: false });
        },
        error => {
          this.setState({ progressView: false });
        }
      );
    }
  }

  setMinNMaxSelect(min,max)
  {
    this.setState({minSelect:min,maxSelect:max});
    // this.setState({maxSelect:max});
  }

  /**
 * update extra
 */
  updateExtras() {
    this.setState({ smp: true,count:0 });
      const removeQuotes = this.state.token;
      const too = this.state.tempData;
      const promises = [];
      for(const ele of too){
        const postData = JSON.stringify({
          idextra: ele.idextra,
          fkidcategory: ele.fkidcategory,
          name: ele.name,
          price: Number(ele.price),
          fkidbusiness: ele.fkidbusiness,
          extraAvailable: ele.extraAvailable
        });
        const pp = fetch(Pref.UpdateExtraUrl + ele.idextra, {
          method: Pref.methodPut,
          headers: {
            Authorization: "Bearer " + removeQuotes,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: postData
        });
        promises.push(pp);
      }
      if(this.state.tempData1.length > 0){
        const bpostDataody = JSON.stringify(this.state.tempData1);
        //////console.log('bpostDataody', bpostDataody);
        const ppxx = fetch(Pref.AddExtraUrl, {
          method: Pref.methodPost,
          headers: {
            Authorization: "Bearer " + removeQuotes,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: bpostDataody
        });
        promises.push(ppxx);
      }
      Promise.all(promises).then(arrOfResults => {
        //////console.log('arrOfResults', arrOfResults);
        this.setState({ smp: false });
        NavigationActions.goBack();
      });
  }
  /**
   *
   * Add extra
   */
  addExtra() {
    this.setState({ smp: true });
    const body = JSON.stringify(this.state.tempData);
    Helper.networkHelperTokenPost(
      Pref.AddExtraUrl,
      body,
      Pref.methodPost,
      this.state.token,
      result => {
        //////console.log(result);
        this.setState({
          categoryList: [],
          tempData: [],
          message: result,
          smp: false,
          extraNameOpt: "",
          extraPrice: "",
          extraNameOptd: "",
          extraPriced: "",
          multi: false,
          hideView: false,
          extraCatId: 0,
          tempName: ""
        });
      },
      error => {
        this.setState({ smp: false });
      }
    );
  }

  onlayout(event){
    var { x, y, width, height } = event.nativeEvent.layout;
    const hx = this.state.scrollX + x;
    const ly = this.state.scrollY + y;
    this.setState({ scrollX: hx, scrollY: ly});
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
      cloned.push({
        fkidcategory: this.state.extraCatId,
        name: this.state.extraNameOpt,
        price: this.state.extraPrice,
        fkidbusiness: this.state.bId
      });
      if(this.state.extraMode){
        this.state.tempData1.push({
          fkidcategory: this.state.extraCatId,
          name: this.state.extraNameOpt,
          price: this.state.extraPrice,
          fkidbusiness: this.state.bId
        });
      }
      if (this.scrollingRef !== undefined){
        //////console.log('x:y', this.state.scrollX + " " + this.state.scrollY);
        this.scrollingRef.scrollTo({ x: this.state.scrollX, y: this.state.scrollY, animated: true});
      }
      this.setState({
        tempData: cloned,
        hideView: false,
        extraNameOpt: "",
        extraPrice: "",
        scrollX:0,
        scrollY:0
      });
    } else {
      this.setState({ message: "נא להוסיף תוספת" });
    }
  }

  _showDialog = () => this.setState({ dialogShow: true });

  _hideDialog = () => this.setState({ dialogShow: false });

  editItems(datasss) {
    const name = datasss.name;
    const price = datasss.price;
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
    const newName = this.state.extraNameOptd;
    const newPrice = this.state.extraPriced;
    const doom = cloned.some(function(obj) {
      if (obj.name === op) {
        obj.name = newName;
        obj.price = newPrice;
        return true;
      }
    });
    this.setState({
      tempData: cloned,
      hideView: false,
      extraNameOptd: "",
      extraPriced: "",
      dialogShow: false,
      tempName: ""
    });
  }

  /**
 * deleteExtras
 */
  deleteExtras(indexx,datass) {
    if(!this.state.extraMode){
      const cloned = this.state.tempData;
      cloned.splice(indexx);
      this.setState({ tempData: cloned });
    }else{
      let kk = false;
      Lodash.map(this.state.tempData1, (ele) =>{
        if (ele.name === datass.name){
          kk = true;
        }
      });
      if(!kk){
        //////console.log('datass', datass);
        this.setState({ showdeletex:true}, () =>{
          if(this.state.showdeletex){
            Alert.alert(
              'התנתקות',
              'האם אתה בטוח?',
              [
                {
                  text: 'לא', onPress: () => { this.setState({ showdeletex: false }) }
                },
                {
                  text: 'כן', onPress: () => {
                    this.setState({ smp: true });
                    const postData = [];
                    postData.push({ first_int: datass.fkidbusiness, second_int: datass.idextra });
                    Helper.networkHelperTokenPost(
                      Pref.DeleteExtraUrl,
                      JSON.stringify(postData),
                      Pref.methodPost,
                      this.state.token,
                      result => {
                        const cloned = Lodash.filter(this.state.tempData, (ele) => {
                          return ele.idextra !== datass.idextra;
                        });
                        //cloned.splice(indexx);
                        // //console.log('deleteExtras', cloned);
                        this.setState({ smp: false, tempData: cloned, showdeletex:false });
                      },
                      error => {
                        this.setState({ smp: false, showdeletex:false });
                      }
                    );
                  }
                }
              ]
            );
          }
        });
      }else{
        const ooo = this.state.tempData[indexx];
        const cloned = this.state.tempData;
        cloned.splice(indexx);
        const tpp = this.state.tempData1;
        const findjj = Lodash.findIndex(tpp, { name: ooo.name});
        if(findjj !== -1){
          this.state.tempData1.splice(findjj);
        }
        this.setState({ tempData: cloned });
      }
    }
  }

  extraStockChecker(mode, rowData, index){
    const { tempData } = this.state;
    const xt = rowData.extraAvailable;
    if (mode){
      rowData.extraAvailable = xt === 1 ? 0 : 1;
    }else{
      rowData.extraAvailable = xt === 0 ? 1 : 0;
    }
    tempData[index] = rowData;
    this.setState({ tempData: tempData });
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRow(rowData, index) {
    return (
      <Row style={{ flexDirection: 'column', marginHorizontal: -8, marginVertical: -6 }}>
        <View styleName="horizontal space-between" style={{ width: '100%',flex:1,}}>
          <Subtitle numberOfLines={1} style={{ color: '#292929', fontSize: 16, fontWeight: 'bold',flex:0.7,alignSelf:'center'}}>{rowData.name}</Subtitle>
          <View style={{ flexDirection: 'row', alignItem: 'center', alignContent: 'center', flex: 0.3,justifyContent:'flex-end'}}>
            <Checkbox
              status={rowData.extraAvailable === 1 ? 'checked' : 'unchecked'}
              color={Colors.green500}
              onPress={() => this.extraStockChecker(true, rowData, index)}
              style={{alignSelf:'center',}}
            />
            <Checkbox
              status={rowData.extraAvailable === 0 ? 'checked' : 'unchecked'}
              color={Colors.red500}
              onPress={() => this.extraStockChecker(false, rowData, index)}
              style={{ alignSelf: 'center', }}
            />
            <TouchableWithoutFeedback onPress={() => this.deleteExtras(index, rowData)}>
              <Image
                source={require('../res/images/delete.png')}
                style={{ width: 14, height: 17,  alignSelf:'center',marginStart:8,marginStart:4}}
              />
            </TouchableWithoutFeedback>
          </View>
        </View>
        {/* <View styleName="horizontal" style={{ marginTop: sizeHeight(1) }}> */}
          <TouchableWithoutFeedback onPress={() => this.editItems(rowData)}>
            <View styleName="horizontal" style={{ marginTop: sizeHeight(1) }}>
              <View
                style={{ alignItem: 'flex-start', flex: 0.5, justifyContent: 'center', borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 48, marginEnd: sizeWidth(1) }}>
                <Subtitle numberOfLines={1} style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(2) }}>{rowData.name}</Subtitle>
              </View>
              
                <View
                  style={{ alignItem: 'flex-start', flex: 0.5, justifyContent: 'center', borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 48, }}>
                  <Subtitle
                    numberOfLines={1}
                    styleName="bold"
                    style={{ color: '#292929', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(2), fontWeight: '700' }}>
                    ₪{rowData.price}
                </Subtitle>
                </View>
            </View>
          </TouchableWithoutFeedback>
        {/* </View> */}
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
        <View style={{ alignItem: 'flex-start', justifyContent:'flex-start',alignSelf:'flex-start',alignContent:'flex-start',marginVertical:sizeHeight(1),marginHorizontal:sizeWidth(2),padding:4}}>
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
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
        <NavigationBar
          styleName="inline no-border"
          rightComponent={
            <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
              <BusinessMenuChoices />               
            </View>
          }
          leftComponent={<View style={{ marginStart: 12 }}>
            <Heading style={{
              fontSize: 20, color: '#292929',
              fontFamily: 'Rubik',
              fontWeight: '700',
            }}> {this.state.extraMode ? "עדכון" : "תוספת חדשה"}</Heading>
          </View>}
        />
        <View styleName="vertical" style={{flex:1,}}>
          <ScrollView showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}
            ref={(ref) => { this.scrollingRef = ref }}>
            <View styleName="vertical sm-gutter" style={{ marginHorizontal: sizeWidth(2), }}>
              <Subtitle style={{ color: '#292929', fontSize: 16, marginTop: sizeHeight(1), marginHorizontal: sizeWidth(2), alignSelf: 'flex-start', fontWeight: '700' }}>{!this.state.extraMode ? "שם קטגורית התוספת" : Lodash.capitalize(this.state.extraName)}</Subtitle>
              {/** show here the amount of to show  */}
              { this.state.extraMode ? <View>
                <View style={{flexDirection:'row', }}>
                  <Subtitle style={{ color: 'black', fontSize: 16, alignSelf: 'flex-start', marginStart: sizeWidth(2) }}>{`מינימום בחירה: `}</Subtitle>
              <Subtitle style={{ color: 'red', fontSize: 16, alignSelf: 'flex-start',  }}>{this.state.minSelect}</Subtitle>
                </View>
                <View style={{flexDirection:'row',marginBottom:sizeHeight(1)}}>
                  <Subtitle style={{ color: 'black', fontSize: 16, alignSelf: 'flex-start', marginStart: sizeWidth(2) }}>{`מקסימום בחירה: `}</Subtitle>
                  <Subtitle style={{ color: 'red', fontSize: 16, alignSelf: 'flex-start',  }}>{this.state.maxSelect === 0 ? `אין הגבלה` : this.state.maxSelect }</Subtitle>
                </View> 
              </View>: null}
              {/* */}
              {this.state.extraMode ? <View style={{
                width: '100%',
                backgroundColor: '#d9d9d9',
                marginVertical: sizeHeight(1),
                height: 1,
              }} /> : null}
              
              
              {!this.state.extraMode ? <TouchableWithoutFeedback onPress={() => this.setState({ showCat: true })}>
                <View
                  style={{ alignItem: 'flex-start', justifyContent: 'center', borderColor: '#dedede', borderStyle: 'solid', borderWidth: 1, color: '#000000', height: 60, marginHorizontal: sizeWidth(1) }}>
                  <Subtitle style={{ color: '#777777', fontSize: 14, alignSelf: 'flex-start', marginHorizontal: sizeWidth(2) }}>{this.state.extraName !== ""
                    ? this.state.extraName
                    : "בחר קטגורית תוספת"}</Subtitle>
                </View>
              </TouchableWithoutFeedback> : null}
              {!this.state.extraMode ? <View styleName="horizontal v-start h-start sm-gutter">
                <Checkbox
                  status={this.state.extraSingle === 1 ? "checked" : "unchecked"}
                  color={'#3DACCF'}
                />
                <Subtitle
                  styleName="bold"
                  style={{
                    alignSelf: "center",
                    color: '#292929',
                  }}
                >
                  אפשר לבחור מספר תוספות
              </Subtitle>
              </View> : null}
              
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
                    label={"שם"}
                    password={false}
                    returnKeyType="next"
                    numberOfLines={1}
                    value={this.state.extraNameOpt}
                    onChangeText={text => this.setState({ extraNameOpt: text })}
                    underlineColor={"transparent"}
                    underlineColorAndroid={"transparent"}
                  />
                  <TextInput
                    style={[styles.inputStyle, { flex: 1, marginStart: sizeWidth(1) }]}
                    mode={"flat"}
                    label={"מחיר"}
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
                    <Subtitle style={{ color: '#292929', fontSize: 14, alignSelf: 'center', marginHorizontal: sizeWidth(2) }}>הוסף תוספת</Subtitle>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </ScrollView>
          <Button
            styleName=" muted border"
            mode={"flat"}
            uppercase={true}
            dark={true}
            style={[styles.loginButtonStyle, { position: "relative", bottom: 0, }]}
            onPress={() => !this.state.extraMode ? this.addExtra() : this.updateExtras()}
          >
            <Subtitle
              style={{ color: "white" }}>{this.state.extraMode === false ? "סיום" : "עדכון נוסף"}
            </Subtitle>
          </Button>
        </View>

        <Portal>
          <Modal
            dismissable={true}
            visible={this.state.showCat}
            onDismiss={() => this.setState({ showCat: false })}
          >
            <View styleName="vertical sm-gutter" style={{backgroundColor:'white',marginHorizontal:sizeWidth(8)}}>
              <Title style={{
                fontSize: 16, 
                color: '#292929',
                fontFamily: 'Rubik',
                fontWeight: '700',
                alignSelf: 'center',
                marginVertical:sizeHeight(1),
                paddingVertical:8,
              }}>בחר קגטורית תוספת</Title>
              <View style={{
                width: '100%',
                backgroundColor: '#d9d9d9',
                height: 1,
              }} />
              {this.state.categoryList.length > 0 ? (
                <FlatList
                  extraData={this.state}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={true}
                  data={this.state.categoryList}
                  ItemSeparatorComponent={() => {
                    return <View style={{
                      width: '100%',
                      backgroundColor: '#d9d9d9',
                      height: 1,
                      marginHorizontal:sizeWidth(1)
                    }} />;
                  }}
                  keyExtractor={(item, index) => item.name}
                  renderItem={({ item: item, index }) =>
                    this.renderCatRow(item, index)
                  }
                />
              ) : null}
            </View>
          </Modal>
        </Portal>
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
              }}>{`עריכת תוספת`}</Title>
              <TextInput
                style={styles.TextInput}
                mode={"flat"}
                label={"שם תוספת"}
                password={false}
                returnKeyType="next"
                numberOfLines={1}
                value={this.state.extraNameOptd}
                onChangeText={text =>
                  this.setState({ extraNameOptd: text })
                }
                underlineColor={"transparent"}
                underlineColorAndroid={"transparent"}
              />
              <TextInput
                style={styles.TextInput}
                mode={"flat"}
                label={"מחיר"}
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
                style={[styles.loginButtonStyle,{marginVertical:sizeHeight(1)}]}
                onPress={() => this.editSave()}>
                <Subtitle
                  styleName="v-center h-center"
                  style={{color: "white"}}>
                  {`שמירה`}
                </Subtitle>
              </Button>
            </View>

          </Modal>
        </Portal>
        {this.state.showAlert ? <AlertDialog isShow={true} title={'שגיאה'} content={this.state.alertContent} callbacks={() => this.setState({ showAlert: false })} /> : null}
        <Loader isShow={this.state.smp}/>
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
    bottom:0,
    paddingVertical:6,
    width:'100%',
    backgroundColor: '#3daccf',
    textAlign: "center",
    margin:0,
  },
  TextInput:{
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
  },
});
