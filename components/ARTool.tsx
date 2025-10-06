import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  Viro3DObject,
  ViroNode,
  ViroARTrackingTargets,
  ViroVideo,
  ViroARImageMarker,
} from '@reactvision/react-viro'
import Button from './Button'
import LottieView from 'lottie-react-native'

function ARScene({ setGlobalLoading }) {
  const [vidScale, setVidScale] = useState([2, 1, 1])
  const [scale, setScale] = useState([1, 1, 1])
  const [modPosition, setPosition] = useState([0, 0, 0])
  const [vidPosition, setVidPosition] = useState([0, 0, 0])

  ViroARTrackingTargets.createTargets({
    targetOne: {
      source: {
        uri: 'https://pohcdn.com/sites/default/files/styles/paragraph__hero_banner__hb_image__1660bp/public/hero_banner/Arch-of-the-Centuries.jpg',
      },
      orientation: 'Up',
      physicalWidth: 0.157,
      type: 'Image',
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setScale([0.5, 0.5, 0.5])
      setVidScale([1, 0.5, 0.5])
      setPosition([0, -0.5, 0])
      setVidPosition([0, 1, 0])
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" />

      <ViroARImageMarker target="targetOne">

      <ViroNode scale={scale}>
        <Viro3DObject
          source={{ uri: 'https://tkp323s.web.app/gwardya_sibil.glb' }}
          type="GLB"
          onLoadStart={() => setGlobalLoading(true)}
          onLoadEnd={() => setGlobalLoading(false)}
          position={modPosition}
        />
      </ViroNode>

      <ViroNode scale={vidScale}>
        <ViroVideo
          source={{ uri: 'https://tkp323s.web.app/archOfTheCenturies.mp4' }}
          loop={true}
          onLoadStart={() => setGlobalLoading(true)}
          onLoadEnd={() => setGlobalLoading(false)}
          position={vidPosition}
        />
      </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  )
}

export function CameraPan() {
  const [loading, setLoading] = useState(false)

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: () => <ARScene setGlobalLoading={setLoading} /> }}
        worldAlignment="Gravity"
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <LottieView
            source={require('../assets/animations/loadSpinner.json')}
            style={{ width: 300, height: 300 }}
            autoPlay
            loop
            
          />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      <Button />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection:"column",
    zIndex: 10,
  }, 
  loadingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    top: -70
  },
})
