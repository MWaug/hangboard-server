import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native'

function AppText({children}) {
    return (
        <Text style={styles.appText}>{children}</Text>
    );
}

const styles = StyleSheet.create({
    appText: {
        fontSize: 18,
        fontFamily: Platform.OS === "ios" ? "Avenir" : "Roboto",
    },
});

export default AppText;