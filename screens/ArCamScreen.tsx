import React from 'react'
import { View, StyleSheet } from 'react-native'
import { FilamentScene, FilamentView, Model, Camera, DefaultLight } from 'react-native-filament'
import { CameraPan } from '../components/ARTool'
import { useUser } from '../context/UserContext'
import GuestLockOverlay from '../components/guestLockOverlay'
function ArCamScreen() {
    const {isGuest} = useUser();
    return (
        <View style={styles.container}>
           
            {!isGuest && <CameraPan />}
            {isGuest && <GuestLockOverlay />}
   
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
