import React, { useRef, useEffect } from 'react';
import Toast, {BaseToast, ErrorToast} from 'react-native-toast-message';
import {View, Text} from "react-native";
import { SuccessComponent } from '../components/toast/successComponent';
import { ErrorComponent } from '../components/toast/ErrorComponent';

export const toastConfig = {
    success: (props: any) => (
        <BaseToast
            {...props}
            // style={{borderLeftColor: 'pink'}}
            contentContainerStyle={{paddingHorizontal: 15}}
            text1Style={{
                fontSize: 15,
                fontWeight: '400',
            }}
        />
    ),

    error: (props: any) => (
        <ErrorToast
            {...props}
            text1Style={{
                fontSize: 17,
            }}
            text2Style={{
                fontSize: 15,
            }}
        />
    ),

    tomatoToast: ({text1, props}: any) => (
        <View style={{height: 60, width: '100%', backgroundColor: 'tomato'}}>
            <Text>{text1}</Text>
            <Text>{props.uuid}</Text>
        </View>
    ),

    successToast: ({props}: any) => <SuccessComponent {...props} />,
    errorToast: ({props}: any) => <ErrorComponent {...props} />,
};
