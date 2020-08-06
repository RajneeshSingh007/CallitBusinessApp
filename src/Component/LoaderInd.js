import React from 'react';
import {View, Text,ActivityIndicator} from 'react-native';
import {Portal, Modal} from 'react-native-paper';

export default class LoaderInd extends React.Component
{
    constructor(props)
    {
        super(props);
        this.setState({

        });
    }

    render()
    {
        const {ShowLoader} = this.props;
        return(
            <Portal>
                <Modal visible={ShowLoader}>
                    <ActivityIndicator animating={ShowLoader} size={100} color={'#5EBBD7'}/>
                </Modal>
            </Portal>
        );
    }
}