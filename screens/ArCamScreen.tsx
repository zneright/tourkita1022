import React from 'react'
import { View, StyleSheet } from 'react-native'
import { FilamentScene, FilamentView, Model, Camera, DefaultLight } from 'react-native-filament'
import { CameraPan } from '../components/ARTool'
function ArCamScreen() {
    return (
        <View style={styles.container}>
            <CameraPan/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    view: {
        flex: 1,
    },
})

export default ArCamScreen
