import React, { useState, useEffect } from 'react';
import { ShapeSource, LineLayer, FillExtrusionLayer } from '@rnmapbox/maps';
import { Button, View } from 'react-native';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../firebase';

const LineBoundary = () => {
    const [visible, setVisible] = useState(true);
    const [features, setFeatures] = useState([]);

    useEffect(() => {
        const db = getFirestore(app);


        const unsubscribe = onSnapshot(collection(db, 'customLandmarks'), (snapshot) => {
            const newFeatures = snapshot.docs.map((doc) => {
                const data = doc.data();
                if (!data.geometry) return null;

                let geometry = data.geometry;
                if (typeof geometry === 'string') {
                    try {
                        geometry = JSON.parse(geometry);
                    } catch (e) {
                        console.warn('Invalid geometry JSON in:', doc.id);
                        return null;
                    }
                }

                return {
                    type: 'Feature',
                    geometry,
                    properties: {
                        color: data.color || '#4F46E5',
                        name: data.name || 'Unnamed Area',
                    },
                };
            }).filter(Boolean);

            setFeatures(newFeatures);
        });

        return () => unsubscribe();
    }, []);

    if (!features.length) return null;

    return (
        <>
            <ShapeSource
                id="landmarkSource"
                shape={{
                    type: 'FeatureCollection',
                    features,
                }}
            >
                <FillExtrusionLayer
                    id="extrusionLayer"
                    belowLayerID="landmark-icons"
                    filter={['==', ['geometry-type'], 'Polygon']}
                    style={{
                        fillExtrusionColor: ['get', 'color'],
                        fillExtrusionHeight: 40,
                        fillExtrusionOpacity: visible ? 0.8 : 0,
                    }}
                />
                <LineLayer
                    id="lineLayer"
                    belowLayerID="landmark-icons"
                    filter={['==', ['geometry-type'], 'LineString']}
                    style={{
                        lineColor: ['get', 'color'],
                        lineWidth: 4,
                        lineJoin: 'round',
                        lineCap: 'round',
                        visibility: visible ? 'visible' : 'none',
                    }}
                />
            </ShapeSource>

            <View style={{ position: 'absolute', top: 50, right: 20 }}>
                <Button
                    title={visible ? 'Hide Landmarks' : 'Show Landmarks'}
                    onPress={() => setVisible(!visible)}
                />
            </View>
        </>
    );
};

export default LineBoundary;
