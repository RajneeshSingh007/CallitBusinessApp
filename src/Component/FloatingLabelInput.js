import React from 'react';
import { StyleSheet,TextInput,Text, Animated, View } from "react-native";
import { sizeWidth, sizeHeight } from "../util/Size";

export default class FloatingLabelInput extends React.Component 
{
    constructor(props) {
        super(props);
        this.state = {
            isFocused: false,
        };
    } 
    componentWillMount()
    {
      this._animatedIsFocused = new Animated.Value(this.props.value === '' ? 0: 1);
    }
  
    componentDidUpdate()
    {
      Animated.timing(this._animatedIsFocused,{
        toValue: (this.state.isFocused || this.props.value !== '') ? 1: 0,
        duration: 200,
      }).start();
    }
  
    handleFocus = () => this.setState({ isFocused: true });
    handleBlur = () => this.setState({ isFocused: false });
  
    render() {
      const { label, ...props } = this.props;
      const { isFocused } = this.state;
      const labelStyle = {
        position: 'absolute',
        left:0,
        top:!isFocused ? sizeHeight(2): 0,
        top:this._animatedIsFocused.interpolate({
          inputRange: [0,1],
          outputRange: [18,0],
        }),
        fontSize: (!isFocused && this.props.value === '') ? 20 : 15,
        fonSize:this._animatedIsFocused.interpolate({
          inputRange: [0,1],
          outputRange: [20,15],
        }),
        color: !isFocused? '#aaa' : '#3daccf',
        color:this._animatedIsFocused.interpolate({
          inputRange: [0,1],
          outputRange: ['#aaa','#3daccf'],
        }),
        marginHorizontal:sizeWidth(2),
        underlineColor: '#aaa',
      };
      return (
        <View style={styles.contianerStyle}>
          <Animated.Text style={labelStyle}>
            {label}
          </Animated.Text>
          <TextInput
            {...props}
            style={styles.textInputStlye}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            underlineColorAndroid='transparent'
          />
        </View>
      );
    }
}

const styles = StyleSheet.create({
    contianerStyle:
    { borderRadius: 2,
        borderColor: '#dedede',
        borderStyle: 'solid',
        borderWidth: 1,
        backgroundColor: '#ffffff',
        marginHorizontal:sizeWidth(5)
    },
   textInputStlye:{ 
        height:sizeHeight(8),
        fontSize: 20,
        color: '#000',
        borderBottomWidth: 0,
        textAlignVertical:'bottom',
        textAlign:'right',
        marginHorizontal:sizeWidth(2),
        textDecorationLine:'none',
        marginBottom:0
        }
  });