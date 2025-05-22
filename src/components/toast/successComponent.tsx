import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
/*import Colors from 'theme/Colors.ts';
import normalize from 'react-native-normalize';
import {FONTFAMILY} from 'theme';*/
import Toast from 'react-native-toast-message';
import { COLORS, POLICE } from '../constants/theme';
import { Ionicons } from "@expo/vector-icons";

export const SuccessComponent = ({
    message,
    icon: Icon = Ionicons,
    onPress,
    okText,
}: any) => {
    return (
        <View style={styles.wrapperContainer}>
            <Icon
                name={'checkmark-circle'}
                size={20}
                color={COLORS.succes}
            />
            <Text style={styles.textMessage}>{message}</Text>
            <TouchableOpacity
                onPress={() => {
                    Toast.hide();
                    onPress && onPress();
                }}
                style={styles.textButton}>
                <Text style={{ color: COLORS.white }}>{okText ?? 'Ok'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapperContainer: {
        backgroundColor: '#27272a',
        flexDirection: 'row',
        gap: 10,
        borderRadius: 15,
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        maxWidth: '80%',
    },
    textMessage: {
        color: COLORS.white,
        flex: 1,
        fontFamily: POLICE.poppins_medium,
        fontSize: 13,
    },
    textButton: {
        backgroundColor: '#3f3f46',
        paddingVertical: 7,
        paddingHorizontal: 10,
        borderRadius: 10,
    },
});
