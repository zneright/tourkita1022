import { LineLayer, ShapeSource, VectorSource } from "@rnmapbox/maps";
import { Position } from "@rnmapbox/maps/lib/typescript/src/types/Position";
import { useLandmark } from "../provider/LandmarkProvider";

export default function LineRoute({ coordinates }: { coordinates: Position[] }) {
    const { mode } = useLandmark() as any;

    return (
        <>
           
           
                <VectorSource id="trafficSource" url="mapbox://mapbox.mapbox-traffic-v1">
                    <LineLayer
                        id="traffic"
                        sourceLayerID="traffic"
                        style={{
                            lineColor: [
                                "match",
                                ["get", "congestion"],
                                "low", "#2ECC71",       
                                "moderate", "#F1C40F",  
                                "heavy", "#E67E22",     
                                "severe", "#E74C3C",   
                                "#BDC3C7"               
                            ],
                            lineWidth: 3,
                            lineCap: "round",
                            lineJoin: "round",
                        }}
                        belowLayerID="landmark-icons"
                    />
                </VectorSource>
        

           
            {coordinates?.length > 0 && (
                <ShapeSource
                    id="route"
                    lineMetrics
                    shape={{
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
                            lineWidth: 4,
                        }}
                        belowLayerID="landmark-icons" 
                    />
                </ShapeSource>
            )}
        </>
    );
}
