import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroAmbientLight,
  Viro3DObject,
  ViroNode
} from '@reactvision/react-viro'
import Button from './Button'

function ARScene() {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <ViroARScene>
      <ViroAmbientLight color="#FFFFFF" />

      <ViroNode position={[1, -.3, -1]} scale={isLoaded ? [0.3, 0.3, 0.3] : [0.001, 0.001, 0.001]}>

        <Viro3DObject

          source={{
            uri: 'https://raw.githubusercontent.com/google/filament/main/third_party/models/DamagedHelmet/DamagedHelmet.glb'
          }}
          type="GLB"
          onLoadEnd={() => setIsLoaded(true)}

        />
      </ViroNode>

      <ViroNode position={[-1, -.3, -1]} scale={isLoaded ? [0.3, 0.3, 0.3] : [0.001, 0.001, 0.001]}>

        <Viro3DObject
          source={{ uri: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' }}
          type="GLB"
          onLoadEnd={() => setIsLoaded(true)}

        />
      </ViroNode>



      <ViroNode position={[0, -1, -1]} scale={isLoaded ? [1, 1, 1] : [0.001, 0.001, 0.001]}>

        <Viro3DObject
          source={{ uri: 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb' }}

          type="GLB"
          onLoadEnd={() => setIsLoaded(true)}

        />
      </ViroNode>





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
    flex: 1
  }
})
