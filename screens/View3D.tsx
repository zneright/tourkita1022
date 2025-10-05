import React from 'react'
import { Camera, DefaultLight, FilamentScene, FilamentView, Model, useCameraManipulator } from 'react-native-filament'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Dimensions, StyleSheet, View, Text } from 'react-native'
import { useSharedValue } from 'react-native-worklets-core'
import Button from '../components/Button'

const modelPath = "https://tkp323s.web.app/arc2.glb"

function Scene() {
    const cameraManipulator = useCameraManipulator({
        orbitHomePosition: [0, 0, 8],
        targetPosition: [0, 0, 0],
        orbitSpeed: [0.003, 0.003],
    })

    const viewHeight = Dimensions.get('window').height

    const panGesture = Gesture.Pan()
        .onBegin((event) => {
            const yCorrected = viewHeight - event.translationY
            cameraManipulator?.grabBegin(event.translationX, yCorrected, false)
        })
        .onUpdate((event) => {
            const yCorrected = viewHeight - event.translationY
            cameraManipulator?.grabUpdate(event.translationX, yCorrected)
        })
        .maxPointers(1)
        .onEnd(() => {
            cameraManipulator?.grabEnd()
        })

    const previousScale = useSharedValue(1)
    const scaleMultiplier = 100

    const pinchGesture = Gesture.Pinch()
        .onBegin(({ scale }) => {
            previousScale.value = scale
        })
        .onUpdate(({ scale, focalX, focalY }) => {
            const delta = scale - previousScale.value
            cameraManipulator?.scroll(focalX, focalY, -delta * scaleMultiplier)
            previousScale.value = scale
        })

    const combinedGesture = Gesture.Race(pinchGesture, panGesture)

    return (
        <GestureDetector gesture={combinedGesture}>
            <FilamentView style={styles.modelView}>
                <Camera cameraManipulator={cameraManipulator} />
                <DefaultLight />
                <Model source={{ uri: modelPath }} transformToUnitCube />
            </FilamentView>
        </GestureDetector>
    )
}

export default function View3D() {
    return (
        <View style={styles.container}>
       
            <Text style={styles.title}>Arch of the Centuries</Text>

          
            <FilamentScene>
                <Scene />
                <Button />
            </FilamentScene>

          
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F4EF',
        paddingTop: 30,
        alignItems: 'center',
    },
    modelView: {
        width: '100%',
        height: 500,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4E342E',
        marginBottom: 10,
    },
})
