/* eslint-disable */
import { LineLayer, ShapeSource } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";

export default function LineRoute({coordinates}: {coordinates: Position[]})
{
    return(
        <ShapeSource
            id="route"
            lineMetrics
            shape={{
                properties: {},
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates
                },
            }}
        >
            <LineLayer
                id="lineLayer"
                style={{
                    lineColor: '#6366F1',
                    lineCap: 'round',
                    lineJoin: 'round',
                    lineWidth: 3,
                }}
            />

        </ShapeSource>
    )
}