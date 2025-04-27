import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import BottomFooter from '../components/BottomFooter';

const ArCamScreen = () => {
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [cameraDevice, setCameraDevice] = useState(null);

    useEffect(() => {
        const requestPermission = async () => {
            const permissionStatus = await Camera.requestCameraPermission();
            if (permissionStatus === 'granted') {
                setPermissionGranted(true);
                const devices = await Camera.getAvailableCameraDevices();
                setCameraDevice(devices.find(device => device.position === 'back') || devices[0]);
            } else {
                setPermissionGranted(false);
            }
        };

        requestPermission();
    }, []);

    if (!permissionGranted || !cameraDevice) {
        return (
            <View style={styles.container}>
                <Text>Camera permission is required or camera device not available.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera style={styles.camera} device={cameraDevice} isActive={true} />
            <BottomFooter active="ArCam" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
});

export default ArCamScreen;
