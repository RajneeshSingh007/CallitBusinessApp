import React from "react";
import { FlatList, SafeAreaView, StatusBar, StyleSheet, TouchableWithoutFeedback,Text,BackHandler} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Button, Checkbox, Chip, Colors, Dialog, Portal, Snackbar,Avatar,Modal,List} from "react-native-paper";
import { Divider,Title, Image, Heading, NavigationBar, Row, Screen, Subtitle, TextInput, TouchableOpacity, View } from "@shoutem/ui";
import { Loader } from "./../customer/Loader";
import * as Helper from "./../util/Helper";
import NavigationAction from "./../util/NavigationActions";
import * as Pref from "./../util/Pref";
import * as Lodash from "lodash";
import DummyLoader from "../util/DummyLoader";
import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';
import { ScrollView } from "react-native-gesture-handler";
import BusinessMenuChoices from "./BusinessMenuChoices";

export default class BusinessAllProductExtra extends React.Component {
  constructor(props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
    this.renderRowProductCat = this.renderRowProductCat.bind(this);
    this.selectedCatExtraItem = this.selectedCatExtraItem.bind(this);
    this.groupClicked = this.groupClicked.bind(this);
    this.expandlisterner = this.expandlisterner.bind(this);
    this.renderTabDataRow = this.renderTabDataRow.bind(this);
    this.itemclicklisterner = this.itemclicklisterner.bind(this);
    this.onFilterClick = this.onFilterClick.bind(this);
    this.backClick = this.backClick.bind(this);
    this.state = {
      close:false,
      filterView:false,
      smp:false,
      progressView: true,
      searchVisibility: false,
      searchCVisibility: false,
      clone: [],
      extrasList: [],
      dialogShow: false,
      extraName: "",
      extraPrice: "",
      extraid: 0,
      fkidcategory: 0,
      fkidbusiness: 0,
      tabNames: ["Category", "Product"],
      selectedTab: 1,
      selectedItem: [],
      allData: [],
      cloneAllData:[],
      onScreen:true,
      connectChoice: false,
      allCloneData: [],
      globalIndex: 0,
      message: "",
      groupChecked:false,
      selectExtracat:false,
      selectedCategoryName:'',
      selectedCategoryItems:[],
      checkAllExtraItems:false,
      selectedExtraItemsOneByOne:[],
      filterBusiness:'',
    };
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backClick);
    this.willfocusListener = this.props.navigation.addListener('willFocus', () => {
      this.setState({ progressView: true });
    });
    this.focusListener = this.props.navigation.addListener('didFocus', () => {
      this.fetchAllExtras();
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backClick);
    if(this.focusListener !== undefined){this.focusListener.remove();}
    if (this.willfocusListener !== undefined) { this.willfocusListener.remove(); }
  }
  
  backClick() {
    if (this.state.filterView) {
      this.setState({ progressView: true });
      this.fetchAllExtras();
      return true;
    } else {
      return false;
    }
  }

  /**
   * Fetch all extras
   */
  fetchAllExtras() {
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Pref.getVal(Pref.bId, biid => {
        Helper.networkHelperToken(
          Pref.FetchExtrasUrl + biid,
          Pref.methodGet,
          removeQuotes,
          result => {
            const modifiedResult = Lodash.map(result, function (item, index) {
              return Lodash.extend({}, item, { selected: false });
            });
            let groupedExtra = Lodash.groupBy(modifiedResult, function (exData) {
              if (exData.category !== '') {
                return exData.category_name;
              }
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              name: key,
              data: groupedExtra[key]
            }));
            //////console.log('serviceCat', serviceCat);
            this.setState({
              isCatgegoryClicked:1,
              progressView: false,
              extrasList: serviceCat,
              clone: result,
              filterBusiness: "",
              close:false,
            });
          },
          error => {
            this.setState({ progressView: false });
          }
        );
      });
      Pref.getVal(Pref.branchId, biid => {
        Helper.networkHelperToken(
          Pref.FetchServicesUrl + biid,
          Pref.methodGet,
          removeQuotes,
          result => {
            ////console.log('srvice', result);
            const modifiedResult = Lodash.map(result, function (item, index) {
              return Lodash.extend({}, item, { checked: false });
            });
            let groupedExtra = Lodash.groupBy(modifiedResult, function (exData) {
              if (exData.category !== '') {
                return exData.category;
              }
            });
            const serviceCat = Object.keys(groupedExtra).map(key => ({
              title: key,
              checked: false,
              selected: false,
              data: groupedExtra[key]
            }));
            ////////console.log('s', serviceCat);
            this.setState({
              progressView: false,
              allData: serviceCat,
              cloneAllData: modifiedResult,
            });
          },
          error => {
            this.setState({ progressView: false });
          }
        );
      }); 
    });
  }

  onFilterClick = () => {
    const ogData = this.state.extrasList;
    let sortedData = [];
    if (this.state.filterBusiness !== '') {
      sortedData = ogData.filter(element => {
        return element.name.toLowerCase().includes(this.state.filterBusiness.toLowerCase());
      });
      this.setState({
        isCatgegoryClicked: 1,
        extrasList: sortedData,
        close: false,
      });
    }
  }

  _showDialog = () => this.setState({ dialogShow: true });

  _hideDialog = () => this.setState({ dialogShow: false });

  /**
   * update extra
   */
  updateExtras() {
    this.setState({ progressView: true });
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      const id = this.state.extraid;
      const postData = JSON.stringify({
        idextra: id,
        fkidcategory: this.state.fkidcategory,
        name: this.state.extraName,
        price: this.state.extraPrice,
        fkidbusiness: this.state.fkidbusiness
      });
      Helper.networkHelperTokenPost(
        Pref.UpdateExtraUrl + id,
        postData,
        Pref.methodPut,
        removeQuotes,
        result => {
         // //////console.log(result);
          const clone = this.state.extrasList;
          const arr = clone.indexOf(id);
          clone.splice(arr);
          this.setState({
            dialogShow: false,
            progressView: false,
            extrasList: clone,
            extraPrice: "",
            extraName: "",
            fkidbusiness: 0,
            fkidcategory: 0,
            idextra: 0
          });
        },
        error => {
          this.setState({ progressView: false });
        }
      );
    });
  }

  /**
   * deleteExtras
   */
  deleteExtras() {
    this.setState({ progressView: true });
    const id = this.state.extraid;
    const bid = this.state.fkidbusiness;
    const postData = [];
    postData.push({ first_int: bid, second_int: id });
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      Helper.networkHelperTokenPost(
        Pref.DeleteExtraUrl,
        JSON.stringify(postData),
        Pref.methodPost,
        removeQuotes,
        result => {
          const clone = this.state.extrasList;
          const arr = clone.indexOf(id);
          clone.splice(arr);
          this.setState({
            dialogShow: false,
            progressView: false,
            extrasList: clone,
            extraPrice: "",
            extraName: "",
            fkidbusiness: 0,
            fkidcategory: 0,
            idextra: 0
          });
        },
        error => {
          this.setState({ progressView: false });
        }
      );
    });
  }

  editclicked(data, title){
    let modif = [];
    const pp = Lodash.map(data, (ele) =>{
      const tuu = ele.extra;
      modif.push({
        idextra: tuu.idextra,
        fkidcategory: tuu.fkidcategory,
        name: tuu.name,
        price: tuu.price,
        fkidbusiness: tuu.fkidbusiness,
        extraAvailable: tuu.extraAvailable,
        isFree:tuu.isFree,
        imageNum:tuu.imageNum
      });
    });
    if(modif !== null && modif !== undefined && modif.length > 0){
      NavigationAction.navigate("BusinessEditAddExtra", {
        extraMode: true,
        datax:modif,
        name: title
      });
    }
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRow(rowData, index) {
    return (
      <View style={{
        marginHorizontal: sizeWidth(3),
        marginVertical: sizeHeight(1.2)}}>
        <TouchableWithoutFeedback
          onPress={() =>{
            this.setState({ selectExtracat:true,selectedCategoryName:rowData.name,selectedCategoryItems:rowData.data })
          } }
        >
          <Row style={{
            borderRadius: 2,
            borderColor: '#dedede',
            borderStyle: 'solid',
            borderWidth: 1,}}>
            <View styleName="vertical v-start h-start">
              <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(1), color: '#292929', fontSize: 16,fontWeight:'400'}} styleName="bold">
                {Lodash.capitalize(rowData.name)}
              </Subtitle>
              {/* <Subtitle numberOfLines={1} style={{margin:5}} styleName="sm-gutter">
                {rowData.price}$
              </Subtitle> */}
            </View>
            <TouchableWithoutFeedback
               onPress={() => this.editclicked(rowData.data,rowData.name)}
            >
            <Image 
              styleName="small"
                style={{ backgroundColor: 'transparent', width: 20, height: 20,marginEnd:-6}} 
              source={require('../res/images/edit.png')} />
            </TouchableWithoutFeedback>
          </Row>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  /**
   * search products
   * @param {Search} text
   */
  filterConnectSearch(text) {
    let select = this.state.selectedTab;
    if (text === "") {
      this.setState({ allData: this.state.allCloneData });
    } else {
      let newData = [];
      let fx = [];
      if (select === 1) {
        newData = this.state.allCloneData[select].filter(item => {
          const itemData = item.name.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
      } else {
        newData = this.state.allCloneData[select].filter(item => {
          const itemData = item.category.toLowerCase();
          return itemData.includes(text.toLowerCase());
        });
      }
      fx[select] = newData;
      ////////console.log(this.state.allCloneData[select]);
      ////////console.log(newData);
      this.setState({
        allData: fx.length > 0 ? fx : this.state.allCloneData
      });
    }
  }
  onnScreen(){
    this.setState({
      onScreen:!this.state.onScreen
    })
  }

  connectService() {
    this.setState({ smp: true, connectChoice:false});
    let fd = this.state.allData;
    let makeup = [];
    const yy = this.state.selectedCategoryItems;
    const tyyy = Lodash.map(yy, (ele)=>{
      if (ele.extra.selected === true) {
        makeup.push({ id: ele.extra.idextra});
      }
    })
    //////console.log("fool", makeup);

    let fool = [];
    const vl = Lodash.map(fd, (element) =>{
        if(element.selected){
          const d = Lodash.map(element.data, v =>{
            const xx = Lodash.map(makeup, (jo) =>{
              fool.push({
                fkservice: v.idservice,
                fkextra: jo.id
              });
            })
          })
        }else{
          const d = Lodash.map(element.data, v => {
            if(v.checked){
              const xx = Lodash.map(makeup, (jo) => {
                fool.push({
                  fkservice: v.idservice,
                  fkextra: jo.id
                });
              });
            }
          })
        }
        return element;
    })
    Pref.getVal(Pref.bBearerToken, value => {
      const removeQuotes = Helper.removeQuotes(value);
      //branch id needed
      Pref.getVal(Pref.branchId, v=>{
        Helper.networkHelperTokenPost(
          Pref.AddServiceExtraUrl + Helper.removeQuotes(v),
          JSON.stringify(fool),
          Pref.methodPost,
          removeQuotes,
          result => {
            //////console.log(result);
            alert(result);
            this.setState({smp: false });
          },
          error => {
            this.setState({ smp: false });
          }
        );
      })
    });
  }

  groupClicked(catname, checkedval, checked){
    const itemList = this.state.allData;
    const datax = Lodash.map(itemList, (element) =>{
      if (catname === element.title) {
        element.selected = !checkedval;
        const opp = Lodash.map(element.data, ele =>{
           ele.checked = !ele.checked;
          return ele;
        })
        element.data = opp;
      } 
      return element;
    })
    //console.log('data', JSON.stringify(datax));
    this.setState({ allData: datax });
  }

  expandlisterner(catname, checkedval) {
    const itemList = this.state.allData;
    const datax = Lodash.map(itemList, (element) => {
      if(catname === element.title){
        element.checked = !checkedval;
      }
       return element;
    })
    this.setState({ allData: datax });
  }

  itemclicklisterner(name){
    let itemList = this.state.allData;
    const vl = Lodash.map(itemList, (el) =>{
      if (el.checked){
        const ty = Lodash.map(el.data, (ele) => {
          if (name === ele.idservice){
            ele.checked = !ele.checked;
          }
          return ele;
        });
        el.data = ty;
      }
      return el;
    });
    ////////console.log('vl', JSON.stringify(vl));
    this.setState({ allData: vl });
  }


  extraAllSelectItemlols(mode, title){
    let data = this.state.selectedCategoryItems;
    const vo = this.state.checkAllExtraItems;
    const result = Lodash.map(data, (ele) =>{
      if(mode == 1){
        ele.extra.selected = !vo;
      }else{
        if(title.toLowerCase() === ele.extra.name.toLowerCase()){
          const vlk = ele.extra.selected;
          ele.extra.selected = !vlk;
        }else{
          ele.extra.selected = false;
        }
      }
      return ele;
    });
    if(mode == 1){
      this.setState({ selectedCategoryItems: result, checkAllExtraItems: !vo });
    }else{
      this.setState({ selectedCategoryItems: result });
    }
  }
  
  /**
 *
 * @param {*} rowData
 * @param {*} index
 */
  renderTabDataRow(eachTabData, index) {
    return (
      <View>
        {index === 0 ? <View style={{
          backgroundColor: '#d9d9d9',
          height: 1,
        }} /> : null}
        <View styleName="horizontal" style={{ paddingVertical: sizeHeight(1), paddingHorizontal: sizeWidth(4)}}>
          <Checkbox
            status={eachTabData.checked ? "checked" : "unchecked"}
            color={'#3daccf'}
            onPress={() => this.itemclicklisterner(eachTabData.idservice)}
          />
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
            {Lodash.capitalize(eachTabData.name)}
          </Subtitle>
        </View>
      </View>
    );
  }
  selectedCatExtraItem(rowData, index){
    return (
      <View>
        <View styleName="vertical">
          <View styleName="horizontal" style={{ justifyContent: 'space-between', paddingVertical: sizeHeight(2), paddingHorizontal: sizeWidth(4) }}>
            <View styleName="horizontal">
              <Checkbox
                status={rowData.extra.selected ? "checked" : "unchecked"}
                color={'#3daccf'}
                onPress={() => this.extraAllSelectItemlols(2, rowData.extra.name)}
              />
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
                {Lodash.capitalize(rowData.extra.name)}
              </Subtitle>
            </View>
          </View>
        </View>
      </View>
    );
  }

  /**
   *
   * @param {*} rowData
   * @param {*} index
   */
  renderRowProductCat(rowData, index) {
    return (
      <View>
        {index == 0 ? <View style={{
          height: 1,
          backgroundColor: '#dedede',
        }} /> : null}
        <View styleName="vertical">
          <View styleName="horizontal" style={{ justifyContent: 'space-between',paddingVertical:sizeHeight(2),paddingHorizontal:sizeWidth(4) }}>
            <View styleName="horizontal">
              <Checkbox
                status={rowData.selected ? "checked" : "unchecked"}
                color={'#3daccf'}
                onPress={() => this.groupClicked(rowData.title, rowData.selected, rowData.checked)}
              />
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
                {Lodash.capitalize(rowData.title)}
              </Subtitle>
            </View>
            <TouchableWithoutFeedback onPress={() => this.expandlisterner(rowData.title, rowData.checked)}>
              <Icon
                style={{ alignSelf: 'flex-end' }}
                name={!rowData.checked ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
                size={24} />
            </TouchableWithoutFeedback>
          </View>
          {rowData.checked ? <FlatList
            extraData={this.state}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            data={rowData.data}
            nestedScrollEnabled={true}
            ItemSeparatorComponent={() => {
              return <View style={{
                backgroundColor: '#d9d9d9',
                height: 1,
              }} />
            }}
            keyExtractor={(item, index) => item.idservice.toString()}
            renderItem={({ item: eachTabData, index }) =>
              this.renderTabDataRow(eachTabData, index)
            }
          /> : null}
        </View>
        {this.state.allData.length - 1 === index ? <View style={{
          height: 1,
          backgroundColor: '#dedede',
        }} /> : null}
      </View>
    );
  }

  setTab = selectedTab => {
    this.setState({ selectedTab });
  };

  render() {
    return (
      <Screen style={{ backgroundColor: "white" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff"/>
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
          rightComponent={
            !this.state.close ? <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
              {/* <TouchableOpacity onPress={() => this.setState({isCatgegoryClicked:2, filterView: true, close: true })}>
                <Image source={require('./../res/images/search.png')}
                  style={{ width: 24, height: 24, marginEnd: 16, }}
                />
              </TouchableOpacity> */}
              <BusinessMenuChoices />
            </View> : <View style={{ flexDirection: 'row', marginEnd: sizeWidth(5) }}>
                <TouchableOpacity onPress={() => this.setState({isCatgegoryClicked:1,filterView: false, close: false })}>
                  <Icon
                    name={'close'}
                    size={36}
                    color={'#292929'} />
                </TouchableOpacity>
              </View>
          }
          leftComponent={<View style={{ marginStart: 12 }}>
            <Heading style={{
              fontSize: 20, color: '#292929',
              fontFamily: 'Rubik',
              fontWeight: '700',
            }}>{this.state.close ? 'חפש' : 'תוספות'}</Heading>
          </View>}
        />          

        {this.state.isCatgegoryClicked == 1 ? <View
          styleName="vertical"
          style={{
            flex: 1,
            backgroundColor: "white"
          }}
        >
          <Button
            styleName=" muted border"
            mode={"contained"}
            uppercase={true}
            dark={true}
            loading={false}
            style={[styles.loginButtonStyle]}
            onPress={() =>
              NavigationAction.navigate("BusinessEditAddExtra", {
                extraMode: false,
                datax: [],
                name: ""
              })
            }
          >

            <Subtitle
              style={{
                color: "white"
              }}
            >יצירת תוספת חדשה</Subtitle>
          </Button>
          <DummyLoader
            visibilty={this.state.progressView}
            center={
              this.state.extrasList !== null && this.state.extrasList !== undefined ? <FlatList
                extraData={this.state}
                data={this.state.extrasList}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => {
                  index.toString();
                }}
                renderItem={({ item: item, index }) =>
                  this.renderRow(item, index)
                }
              /> : <Subtitle style={{ color: '#777777', fontSize: 14, alignSelf: 'center', fontWeight: '400' }}>...לא נמצאו תוספות</Subtitle>
            }
          />
        </View> : null}
        {this.state.isCatgegoryClicked == 2 ? <View style={{ flexDirection: 'column', marginTop: sizeHeight(3) }}>
          <TextInput
            mode='flat'
            label={"שם התוספת"}
            underlineColor='transparent'
            underlineColorAndroid='transparent'
            style={styles.inputStyle}
            placeholderTextColor={'#DEDEDE'}
            placeholder={"שם התוספת"}
            onChangeText={value => this.setState({ filterBusiness: value })}
            value={this.state.filterBusiness}
          />
          <Button
            styleName=" muted border"
            mode={"contained"}
            uppercase={true}
            dark={true}
            loading={false}
            style={{
              color: "white",
              bottom: 0,
              paddingVertical: sizeWidth(2),
              marginHorizontal: sizeWidth(4),
              marginBottom: sizeHeight(2),
              top: sizeHeight(4),
              backgroundColor: '#3daccf',
              textAlign: "center",
            }}
            onPress={this.onFilterClick}
          >

            <Subtitle
              style={{
                color: "white"
              }}
            >חפש</Subtitle>
          </Button>
        </View> : null}
        {this.state.dialogShow === true ? (
          <Portal>
            <Dialog visible={this._showDialog} onDismiss={this._hideDialog}>
              <Dialog.Title>Edit Extra</Dialog.Title>
              <Divider styleName="line" />
              <Dialog.Content>
                <View styleName="vertical sm-gutter">
                  <TextInput
                    style={{
                      height: sizeHeight(8),
                      borderRadius: 2,
                      borderColor: '#dedede',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      backgroundColor: '#ffffff',
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(1),
                      color: '#777777',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      fontWeight: '400',
                    }}
                    mode={"flat"}
                    label={"Name"}
                    password={false}
                    returnKeyType="next"
                    numberOfLines={1}
                    value={this.state.extraName}
                    onChangeText={text =>
                      this.setState({ extraName: text })
                    }
                    underlineColor={"transparent"}
                    underlineColorAndroid={"transparent"}
                  />

                  <TextInput
                    style={{
                      height: sizeHeight(8),
                      borderRadius: 2,
                      borderColor: '#dedede',
                      borderStyle: 'solid',
                      borderWidth: 1,
                      backgroundColor: '#ffffff',
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(1),
                      color: '#777777',
                      fontFamily: 'Rubik',
                      fontSize: 16,
                      fontWeight: '400',
                    }}
                    mode={"flat"}
                    label={"Price"}
                    password={false}
                    returnKeyType="done"
                    numberOfLines={1}
                    keyboardType={"numeric"}
                    value={this.state.extraPrice}
                    onChangeText={text =>
                      this.setState({ extraPrice: text })
                    }
                    underlineColor={"transparent"}
                    underlineColorAndroid={"transparent"}
                  />

                  <Button
                    mode={"contained"}
                    style={{
                      color: "white",
                      bottom: 0,
                      paddingVertical: sizeWidth(2),
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(2),
                      backgroundColor: '#3daccf',
                      textAlign: "center",
                    }}
                    onPress={() => this.updateExtras()}
                  >
                    <Subtitle
                      styleName="v-center h-center"
                      style={{
                        color: "white"
                      }}
                    >
                      Update
                        </Subtitle>
                  </Button>

                  <Button
                    mode={"contained"}
                    style={{
                      color: "white",
                      bottom: 0,
                      paddingVertical: sizeWidth(2),
                      marginHorizontal: sizeWidth(1),
                      marginTop: sizeHeight(2),
                      backgroundColor: Colors.red500,
                      textAlign: "center",
                    }}
                    onPress={() => this.deleteExtras()}
                  >
                    <Subtitle
                      styleName="v-center h-center"
                      style={{
                        color: "white"
                      }}
                    >
                      מחיקה
                    </Subtitle>
                  </Button>
                </View>
              </Dialog.Content>
            </Dialog>
          </Portal>
        ) : null}
        <Portal>
          <Modal
          dismissable={true}
          visible={this.state.connectChoice}
          onDismiss={()=>this.setState({connectChoice:false})}
            contentContainerStyle={{
              marginHorizontal: sizeWidth(4),}}>
              <ScrollView>
              <View styleName="vertical" style={{
                flex:1,
                backgroundColor: 'white',
              }}>
                <View
                  style={{ alignItem: 'flex-start', justifyContent: 'center', height: 60, marginHorizontal: sizeWidth(1) }}>
                  <Heading style={{
                    fontSize: 18, color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center'
                  }}> הוסף תוספת</Heading>
                </View>
                <View
                  styleName="vertical"
                  style={{
                    flex: 1,
                    backgroundColor: "white"
                  }}
                >
                  <DummyLoader
                    visibilty={this.state.progressView}
                    center={
                      <FlatList
                        extraData={this.state}
                        data={this.state.allData}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        keyExtractor={(item, index) => {
                          index.toString();
                        }}
                        ItemSeparatorComponent={() => {
                          return <View style={{
                            height: 1,
                            backgroundColor: '#dedede',
                          }} />;
                        }}
                        renderItem={({ item: item, index }) =>
                          this.renderRowProductCat(item, index)
                        }
                      />
                    }
                  />
                </View>
                <Button
                  mode={"contained"}
                  style={styles.loginButtonStyle}
                  onPress={() => this.connectService()}
                >
                  <Subtitle
                    styleName="v-center h-center"
                    style={{
                      color: "white"
                    }}
                  >
                    חיבור תוספת
              </Subtitle>
                </Button>
              </View>
              </ScrollView>
          </Modal>
        </Portal>
        
        <Portal>
          <Modal
            dismissable={true}
            visible={this.state.selectExtracat}
            onDismiss={() => this.setState({ selectExtracat: false, selectedCategoryName: '', selectedCategoryItems: [], checkAllExtraItems:false})}
            contentContainerStyle={{
              marginHorizontal: sizeWidth(4),
            }}>
            <ScrollView>
              <View styleName="vertical" style={{
                flex: 1,
                backgroundColor: 'white',
              }}>
                <View
                  style={{ alignItem: 'center', justifyContent: 'space-between', height: 60, marginHorizontal: sizeWidth(4),flexDirection:'row',}}>
                  <Heading style={{
                    fontSize: 18,
                    color: '#292929',
                    fontFamily: 'Rubik',
                    fontWeight: '700',
                    alignSelf: 'center'
                  }}> {this.state.selectedCategoryName}</Heading>
                  <View style={{flexDirection:'row',alignItem:'center',justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                    <Subtitle numberOfLines={1} style={{ marginHorizontal: sizeWidth(0.5), color: '#292929', fontSize: 16, alignSelf: 'center' }}>
                      בחר הכל
                    </Subtitle>
                    <Checkbox
                      status={this.state.checkAllExtraItems ? "checked" : "unchecked"}
                      color={'#3daccf'}
                      style={{ alignSelf: 'center', justifyContent: 'center', alignItems:'center',alignContent:'center', backgroundColor:'blue' }}
                      onPress={() => this.extraAllSelectItemlols(1,"hoho")}
                    />
                  </View>
                </View>
                <View
                  styleName="vertical"
                  style={{
                    flex: 1,
                    backgroundColor: "white"
                  }}
                >
                  <DummyLoader
                    visibilty={this.state.progressView}
                    center={
                      <FlatList
                        extraData={this.state}
                        data={this.state.selectedCategoryItems}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={true}
                        nestedScrollEnabled={true}
                        keyExtractor={(item, index) => {
                          index.toString();
                        }}
                        ItemSeparatorComponent={() => {
                          return <View style={{
                            height: 1,
                            backgroundColor: '#dedede',
                          }} />;
                        }}
                        renderItem={({ item: item, index }) =>
                          this.selectedCatExtraItem(item, index)
                        }
                      />
                    }
                  />
                </View>
                <Button
                  mode={"contained"}
                  style={styles.loginButtonStyle}
                  onPress={() => this.setState({ selectExtracat: false, connectChoice: true})}
                >
                  <Subtitle
                    styleName="v-center h-center"
                    style={{
                      color: "white"
                    }}
                  >
                    סיום
              </Subtitle>
                </Button>
              </View>
            </ScrollView>
          </Modal>
        </Portal>
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
   buttonStyle: {
    flexGrow: 1,
    marginTop: 8,
    padding: 6,
    width:'90%',
    alignSelf:'center',
    backgroundColor: Colors.red500,
    textAlign: "center"
  },
  applyButton: {
    textAlign: "center",
    justifyContent: "center",
    backgroundColor: "blue",
    position: "relative",
    borderRadius: 24,
    paddingStart: 2,
    paddingEnd: 2,
    paddingTop: 2,
    paddingBottom: 2,
    marginBottom: 8,
    width: Helper.deviceWidth() * 0.4,
    alignSelf: "center",
    elevation: 4
  },
  fab: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    marginBottom: 6,
    backgroundColor: Colors.red500
  },
  inputStyle: {
    height: sizeHeight(8),
    borderRadius: 2,
    borderColor: '#dedede',
    borderStyle: 'solid',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: sizeWidth(4),
    color: '#777777',
    fontFamily: 'Rubik',
    fontSize: 16,
    fontWeight: '400',
  },
  loginButtonStyle: {
    color: "white",
    bottom: 0,
    paddingVertical: sizeWidth(2),
    marginHorizontal: sizeWidth(4),
    marginBottom: sizeHeight(2),
    marginTop: sizeHeight(2),
    backgroundColor: '#3daccf',
    textAlign: "center",
  }
});
