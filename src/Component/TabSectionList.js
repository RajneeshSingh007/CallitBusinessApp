import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from "react-native";

import * as Helper from "./../util/Helper";
import * as Pref from "./../util/Pref";
import * as Lodash from "lodash";
import { sizeHeight, sizeWidth } from './../util/Size';

import SectionList from 'react-native-tabs-section-list';




export default class TabSectionList extends React.Component
{
  constructor(props)
  {
      super(props);
      this.state={
        productList: [],
      };
  }

  componentDidMount() {
      this.fetchAllProducts();
  }

  componentWillUnmount() {
  }

  fetchAllProducts() {
    this.setState({ progressView: true });
    Pref.getVal(Pref.bBearerToken, value => {
      const token = Helper.removeQuotes(value);
      Pref.getVal(Pref.branchId, value => {
        Helper.networkHelperToken(
          Pref.FetchServicesUrl + value,
          Pref.methodGet,
          token,
          result => {
            let groupedCategory = Lodash.groupBy(result, function (exData) {
                if (exData.category !== '') {
                  return exData.category + ":" + exData.categoryDescription;
                }
            });
            const serviceCat = Object.keys(groupedCategory).map(key => ({
              title: key.split(":")[0],
              description: key.split(":")[1],
              data:groupedCategory[key]
            })); 
            this.setState({
                isCatgegoryClicked: 1,
                progressView: false,
                productList: serviceCat,
                clone: result,
                token: token,
            });
          },
          error => {
              this.setState({ progressView: false });
          }
        );
      });
    });
  }

  renderItem = ({item,index,section}) =>
  {
    return(
      <TouchableOpacity >
        <View style={ {flex:1, backgroundColor:'white'}}>
          <View style={{flexDirection:'row',margin:10,flex:1}}>
            <Image
                source={{ uri: `${Pref.BASEURL}${item.imageUrl}` }}
                style={styles.image}
            />
            <View style={{flex:1,margin:sizeWidth(2)}}>
              <View style={{flex:1, flexDirection:'row' ,justifyContent:'space-between', alignItems:'flex-start',}}>
                <Text style={styles.itemTitle}> {item.name}</Text>
                <Text style={styles.itemTitle}> ₪{item.price}</Text>
              </View>
            <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
        </View>
      </View>
    </TouchableOpacity>
    );
  }

  renderSection = ({section}) =>
  {
    
    return(
      <View  style={{flex:1, borderColor:'#DEDEDE',borderWidth:1,}}>
      <View style={{flex:1,margin:10,borderRadius: 2,}}>        
        <Text style={{fontFamily: 'Rubik',
          fontSize: 16,
          fontWeight: '700',
          lineHeight: 25,color:'#3daccf'}}>{section.title}</Text>
        <Text style={styles.itemDescription}>{section.description}</Text>
      </View>
      </View>
    );
  }

  render() 
  {
    // const {myHeader} = this.props;
    return (
      <View style={{flex:1}}>
        <SectionList
          //compsAbove={myHeader}
          sections={this.state.productList}
          keyExtractor={item => item.title}
          // nestedScrollEnabled={true}
          // stickySectionHeadersEnabled={false} 
          nestedScrollEnabled={true} 
          scrollToLocationOffset={0}
          maxToRenderPerBatch={15}
          tabBarStyle={styles.tabBar}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderTab={({ title, isActive }) => (
            <View
              style={[
                styles.tabContainer,
                { borderBottomWidth: isActive ? 1 : 0,
                  borderBottomColor:'#3daccf',                
                }
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? '#3daccf' : '#9e9e9e' }
                ]}
              >
                {title}
              </Text>
            </View>
          )}
          renderSectionHeader={this.renderSection}
          renderItem={this.renderItem}
        />
      </View>
    );
  }   
}
  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f6f6f6'
    },
    tabBar: {
      backgroundColor: '#fff',
      borderBottomColor: '#f4f4f4',
      borderBottomWidth: 1
    },
    tabContainer: {
      borderBottomColor: '#090909'
    },
    tabText: {
      padding: 15,
      color: '#9e9e9e',
      fontSize: 18,
      fontWeight: '500'
    },
    separator: {
      height: 0.5,
      width: '96%',
      alignSelf: 'flex-end',
      backgroundColor: '#eaeaea'
    },
    sectionHeaderContainer: {
      height: 10,
      backgroundColor: '#f6f6f6',
      borderTopColor: '#f4f4f4',
      borderTopWidth: 1,
      borderBottomColor: '#f4f4f4',
      borderBottomWidth: 1
    },
    sectionHeaderText: {
      color: '#010101',
      backgroundColor: '#fff',
      fontSize: 23,
      fontWeight: 'bold',
      paddingTop: 25,
      paddingBottom: 5,
      paddingHorizontal: 15
    },
    itemContainer: {
      paddingVertical: 20,
      paddingHorizontal: 15,
      backgroundColor: '#fff'
    },
    itemTitle: {
      color: '#292929',
      fontFamily: 'Rubik',
      fontSize: 16,
      fontWeight: '700',
      lineHeight: 25,
    },
    itemDescription: {
      color: '#292929',
      fontFamily: 'Rubik',
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 25,
    },
    image:{
      width: 65,
      height: 65,
      borderTopEndRadius: 8,
      borderTopLeftRadius: 8,
      borderTopRightRadius: 8,
      borderTopStartRadius: 8,
      borderBottomRightRadius: 8,
      borderBottomStartRadius: 8,
      borderBottomEndRadius: 8,
      borderBottomLeftRadius: 8,
  },
});
