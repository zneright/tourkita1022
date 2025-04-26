import boundaries from '../data/boundaries.json'
import { ShapeSource, LineLayer } from '@rnmapbox/maps'

const LineBoundary = () => {
    return (
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