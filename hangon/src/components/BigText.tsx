import React from 'react';
import { Platform, Text, StyleSheet } from 'react-native'

function BigText({children}) {
    return (
        <Text style={styles.bigText}>{children}</Text>
    );
}

const styles = StyleSheet.create({
    bigText: {
        fontSize:48,
        fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    }
});

export default BigText;