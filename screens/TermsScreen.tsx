import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TermsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Term Screen (Placeholder)</Text>
        </View>
    );
};

export default TermsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
