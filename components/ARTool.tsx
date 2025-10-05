import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  Viro3DObject,
  ViroNode,
  ViroARTrackingTargets,
  ViroARImageMarker,
  ViroVideo
} from '@reactvision/react-viro'
import Button from './Button'

function ARScene() {
  const [isLoaded, setIsLoaded] = useState(false)
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
  });


  useEffect(() => {
    let timer
    if (isLoaded) {
      timer = setTimeout(() => {
        setScale([0.5, 0.5, 0.5])
        setPosition([0, -0.5, 0])
        setVidPosition([0,1,0])
      }, 5000)
    }
    return () => clearTimeout(timer)
  }, [isLoaded])

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" />

   
      <ViroARImageMarker target="targetOne">
        <ViroNode  scale={scale}>
        
          <Viro3DObject
            source={{ uri: 'https://tkp323s.web.app/arc.glb' }}
            type="GLB"
            onLoadEnd={() => setIsLoaded(true)}
            position={modPosition}
          />

    
          <ViroVideo
            source={{ uri: 'https://tkp323s.web.app/archOfTheCenturies.mp4' }}
            loop={true}
            position={vidPosition}
          />
        </ViroNode>
      </ViroARImageMarker>
    </ViroARScene>
  )
}

export function CameraPan() {
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{ scene: ARScene }}
        worldAlignment="Gravity"
      />
      <Button />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
