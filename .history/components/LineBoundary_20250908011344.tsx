import boundaries from '../data/boundaries.json'
import { ShapeSource, LineLayer } from '@rnmapbox/maps'
import type { FeatureCollection, Geometry } from 'geojson'

const LineBoundary = () => {
        <ShapeSource id="linesource" shape={boundaries as FeatureCollection<Geometry>}>
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
    )
}

export default LineBoundary;