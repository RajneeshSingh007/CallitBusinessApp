import React from 'react';
import {StyleSheet, Text,View, TouchableWithoutFeedback} from 'react-native';

import {sizeHeight, sizeWidth, sizeFont} from './../util/Size';

export default class DoubleTab extends React.Component
{
    constructor(props) {
        super(props);
        this.state = {
            rightChecked:true,
        };
    }

    componentDidMount()
    {

    }
    
    onPress= () =>
    {
        const {rightChecked} = this.state;
        const {MakeRightChecked} = this.props;
        if(rightChecked === true)
        {
            this.setState({rightChecked:false});
            if(MakeRightChecked !== null && MakeRightChecked!== undefined)
                MakeRightChecked(false);
            // console.log("Left is checked");
        }
        else
        {
            this.setState({rightChecked:true});
            if(MakeRightChecked !== null && MakeRightChecked!== undefined)
                MakeRightChecked(true);
            // console.log("Right is checked");
        }
    }

    render()
    {
        const {RightText,LeftText} = this.props;
        return(<View
            style={[,styles.container]}>
            <TouchableWithoutFeedback
              onPress={this.onPress}>
              <View
                style={[{
                  backgroundColor: this.state.rightChecked
                    ? '#5EBBD7'
                    : 'white',
                },styles.viewText]}>
                <Text
                  styleName="bold"
                  style={[{
                    color: this.state.rightChecked
                      ? 'white'
                      : '#777777',
                  },styles.text]}>{RightText}</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback
              onPress={this.onPress}>
              <View
                style={[{
                    backgroundColor: !this.state.rightChecked
                    ? '#5EBBD7'
                    : 'white',
                    },styles.viewText]}>
                <Text
                  styleName="bold"
                  style={[{
                    color: !this.state.rightChecked
                      ? 'white'
                      : '#777777',
                  },styles.text]}>{LeftText}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>);
    }
};



const styles =  StyleSheet.create({
    container:{
        flexDirection: 'row',
        borderRadius: 1,
        borderColor: '#dedede',
        borderStyle: 'solid',
        borderWidth: 1,
        // marginTop: sizeHeight(1),
        marginHorizontal: sizeWidth(5),
        height: sizeHeight(7),
        // marginBottom:sizeHeight(1),
    },
    viewText:{
        flex: 0.5,
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text:{
        fontFamily: 'Rubik',
        fontSize: 16,
        fontWeight: '700',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
});