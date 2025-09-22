import boundaries from '../data/boundaries.json'
import trademarks from '../data/trademarks.json'
import { ShapeSource, LineLayer, FillLayer, FillExtrusionLayer } from '@rnmapbox/maps'


import { Button, View } from 'react-native'
const LineBoundary = ({ visible }: { visible: boolean }) => {
   
    return (
        <>
            
            <ShapeSource id="linesource" shape={boundaries}>
                <LineLayer
                    id="lineLayer2"
                    style={{
                        lineColor: "#493628",
                        lineWidth: 5,
                        lineJoin: 'round',
                        lineCap: 'round',
                    }}
                  
                />
            </ShapeSource>
            <ShapeSource id = "trademarksSource" shape ={trademarks}>
                <FillExtrusionLayer
                    id="mapuaExtrusion"
                    style={{
                        fillExtrusionColor: "#4F46E5",   // building color
                        fillExtrusionHeight: 39,         // height in meters
                        fillExtrusionBase: 0,            // base height (ground level)
                        fillExtrusionOpacity: 0.8,
                        visibility: visible ? "visible" : "none",     // slightly transparent
                    }}
                />
            </ShapeSource>
            
            
            <View style={{ position: 'absolute', top: 50, right: 20 }}>
                <Button
                    title={visible ? "Hide Buildings" : "Show Buildings"}
                    onPress={() => setVisible(!visible)}
                />
            </View>

        </>
    )
}

export default LineBoundary
