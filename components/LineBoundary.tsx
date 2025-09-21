import boundaries from '../data/boundaries.json'
import palacio from '../data/palacio.json'
import { ShapeSource, LineLayer, FillLayer, FillExtrusionLayer } from '@rnmapbox/maps'

const LineBoundary = () => {
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
                        fillExtrusionOpacity: 0.8,       // slightly transparent
                    }}
                />
            </ShapeSource>

        </>
    )
}

export default LineBoundary
