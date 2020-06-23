import React, { Component } from "react";
import { TouchableWithoutFeedback } from 'react-native';
import { Colors, Modal } from "react-native-paper";
import { Spinner, Subtitle, Title, View, Button } from "@shoutem/ui";
import { sizeHeight, sizeWidth } from './Size';

export class AlertDialog extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
        }
    }

    componentDidMount() {
        const { isShow } = this.props;
        this.setState({ isShow: isShow });
    }

    onDismiss = () => {
        this.setState({ isShow: false });
        this.props.callbacks();
    }

    render() {
        const { title, content, callbacks } = this.props;
        return (
            <Modal
                onDismiss={this.onDismiss}
                dismissable={true}
                visible={this.state.isShow}
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

                    <Title
                        style={{
                            fontSize: 18,
                            fontWeight: "700",
                            paddingVertical: 8,
                            paddingHorizontal: 8,
                            marginHorizontal: 8,
                        }}
                    >
                        {title}
                    </Title>
                    <Subtitle
                        style={{
                            fontSize: 16,
                            fontWeight: "400",
                            paddingHorizontal: 8,
                            marginHorizontal: 8,
                            marginVertical: 12,
                        }}
                    >
                        {content}
                    </Subtitle>

                    <TouchableWithoutFeedback onPress={this.onDismiss}>
                        <Subtitle
                            style={{
                                fontSize: 16,
                                fontWeight: "400",
                                color: '#3DACCF',
                                paddingHorizontal: 8,
                                marginHorizontal: 8,
                                marginVertical: 8,
                                alignSelf: 'flex-end'
                            }}
                        >
                            {'סגור'}
                        </Subtitle>
                    </TouchableWithoutFeedback>
                </View>
            </Modal>
        );
    }
}
