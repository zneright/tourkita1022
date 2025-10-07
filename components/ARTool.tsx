import React, { useState, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
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

function ARScene() {
  const [vidScale, setVidScale] = useState([2, 1, 1])
  const [scale, setScale] = useState([1, 1, 1])
  const [modPosition, setPosition] = useState([0, 0, 0])
  const [vidPosition, setVidPosition] = useState([0, 0, 0])
  const [guardPosition, setGuardPosition] = useState([0, 0, -1])
  const [guardScale, setGuardScale] = useState([1, 1, 1])

  ViroARTrackingTargets.createTargets({
    targetOne: {
      source: {
        uri: 'https://pohcdn.com/sites/default/files/styles/paragraph__hero_banner__hb_image__1660bp/public/hero_banner/Arch-of-the-Centuries.jpg',
      },
      orientation: 'Up',
      physicalWidth: 0.157,
      type: 'Image',
    },
    targetTwo: {
      source: {
        uri: 'https://i0.wp.com/www.theurbanroamer.com/wp-content/uploads/2017/11/26586264099_9fae38c747_b1.jpg',
      },
      orientation: 'Up',
      physicalWidth: 0.157,
      type: 'Image',
    },
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setScale([1, 1, 1])
      setVidScale([1, 0.5, 0.5])
      setPosition([0, -1, -1])
      setVidPosition([0, 1, -1])
     
    }, 5000)
    return () => clearTimeout(timer)
  }, [scale])

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" />

      <ViroARImageMarker target="targetOne">
        <ViroNode scale={scale}>
          <Viro3DObject
            source={{ uri: 'https://tkp323s.web.app/UST_ARC.glb' }}
            type="GLB"
            position={modPosition}
          />
        </ViroNode>




        <ViroNode scale={vidScale}>
          <ViroVideo
            source={{ uri: 'https://tkp323s.web.app/archOfTheCenturies.mp4' }}
            loop={true}
            position={vidPosition}
          />
        </ViroNode>
      </ViroARImageMarker>

   
      <ViroARImageMarker target="targetTwo">
        <ViroNode scale={scale}>
          <Viro3DObject
            source={{ uri: 'https://tkp323s.web.app/Puerta_del_Parian.glb' }}
            type="GLB"
            position={modPosition}
          />
        </ViroNode>

        <ViroNode scale={vidScale}>
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
        autofocus
        initialScene={{ scene: () => <ARScene /> }}
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
