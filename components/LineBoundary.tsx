import boundaries from '../data/boundaries.json'
import palacio from '../data/palacio.json'
import { ShapeSource, LineLayer, FillLayer, FillExtrusionLayer } from '@rnmapbox/maps'
import mapua from '../data/mapua.json'
import gs from '../data/guadalupe_shrine.json'
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

            
            <ShapeSource id="palacioSource" shape={palacio}>
                <FillExtrusionLayer
                    id="palacioExtrusion"
                    style={{
                        fillExtrusionColor: "#4F46E5",   // building color
                        fillExtrusionHeight: 40,         // height in meters
                        fillExtrusionBase: 0,            // base height (ground level)
                        fillExtrusionOpacity: 0.8,     
                        visibility: visible ? "visible" : "none",  // slightly transparent
                    }}
                />
            </ShapeSource>

            <ShapeSource id="mapuaSource" shape={mapua}>
                <FillExtrusionLayer
                    id="mapuaExtrusion"
                    style={{
                        fillExtrusionColor: "#4F46E5",   // building color
                        fillExtrusionHeight: 39     ,         // height in meters
                        fillExtrusionBase: 0,            // base height (ground level)
                        fillExtrusionOpacity: 0.8,  
                        visibility: visible ? "visible" : "none",     // slightly transparent
                    }}
                />
            </ShapeSource>


            <ShapeSource id="gsSource" shape={gs}>
                <FillExtrusionLayer
                    id="gsExtrusion"
                    style={{
                        fillExtrusionColor: "#4F46E5",   // building color
                        fillExtrusionHeight: 10,         // height in meters
                        fillExtrusionBase: 0,            // base height (ground level)
                        fillExtrusionOpacity: 0.8,   
                        visibility: visible ? "visible" : "none",    // slightly transparent
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
