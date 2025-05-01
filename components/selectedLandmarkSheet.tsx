/* eslint-disable */
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { Text, Image, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLandmark } from "../provider/LandmarkProvider";

import Entypo from '@expo/vector-icons/Entypo';
import Fontisto from '@expo/vector-icons/Fontisto';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';


export default function SelectedLandmarkSheet() {
    const {selectedLandmark, duration, distance, loadingDirection, loadDirection, } = useLandmark();
    const bottomSheetRef = useRef<BottomSheet>(null);

    useEffect(() => {
        console.log("Selected Landmark:", selectedLandmark);
        if (selectedLandmark) {
          
            bottomSheetRef.current?.expand();
        }
    }, [selectedLandmark, duration, distance]);

 
   const handleGetDirection = () =>{
    loadDirection();
   }

       

    return (
        <BottomSheet
            backgroundStyle={{ backgroundColor: "#D6C0B3", }}
            ref={bottomSheetRef} index={-1} enableDynamicSizing enablePanDownToClose>
            <BottomSheetView style={{ padding: 10 }}>
                <View style={{ flexDirection: "column", justifyContent: "space-between", gap: 10 }}>
                    <View style={{ flexDirection: "row", gap: 5 }}>
                        <Text style={{
                            color: "#6B5E5E",
                        }}>AR Camera Supported</Text>

                        
                        <View style={{ flexDirection: "row", gap: 5, justifyContent: "flex-end", flex: 1 }}>

                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <FontAwesome5 name="route" size={15} color="black" />
                                {loadingDirection ? (<ActivityIndicator color="white" size="small" />) : ( <Text >  {(duration / 1000).toFixed(2)} km</Text>)}
                            </View>
                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <Entypo name="back-in-time" size={18} color="black" />
                                {loadingDirection ? (<ActivityIndicator color="white" size="small" />) : (<Text>{(distance/ 60).toFixed()} min</Text>)}
                            </View>
                    </View>


                    </View>


                    <View style={{ flexDirection: "row", alignItems: "center" }}>

                        <View style={{ flex: 1 }}>
                            <Image source={{ uri: selectedLandmark?.imageUrl }} style={{
                                height: 110,
                                width: 175,
                                borderRadius: 10

                            }} />
                        </View>

                        <View style={{ flex: 1, gap: 5, }}>

                            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{selectedLandmark?.name}</Text>
                            <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
                                <Entypo name="location-pin" size={20} color="black" />
                                <Text style={{ fontSize: 15 }}>{selectedLandmark?.address}</Text>
                            </View>

                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <Entypo name="warning" size={20} color="red" />
                                <Text>{selectedLandmark?.status}</Text>
                            </View>

                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <Fontisto name="ticket" size={20} color="black" />
                                <Text>Entrance is {selectedLandmark?.entrance}</Text>
                            </View>


                            <View style={{ flexDirection: "row", gap: 5 }}>
                                <Ionicons name="time" size={20} color="black" />
                                <Text>{selectedLandmark?.openingHours}</Text>
                            </View>

                        </View>
                    </View>

                    <View>
                        <Text style={{ fontWeight: "bold", fontSize: 15, }}>Description</Text>
                        <Text style={{ color: "#6B5E5E", textAlign: "justify" }}>{selectedLandmark?.description}</Text>
                    </View>
                    <TouchableOpacity>

                        <View style={{ flexDirection: "row", gap: 5 }}>
                            <Text>Learn More</Text>
                            <Entypo name="arrow-bold-right" size={18} color="black" />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleGetDirection} disabled={loadingDirection}> 
                        <View style={{
                            width:"75%",
                            height:50,
                            backgroundColor: "#6B5E5E",
                            borderRadius: 15,
                            alignSelf:"center",
                            alignItems:"center",
                            justifyContent:"center",
                            flexDirection:"row",
                            gap: 10
                        }}>
                            {loadingDirection ? (
                                <ActivityIndicator color = "white" size="small" /> ) :(
                                <> 
                                    <Entypo name="direction" size={24} color="white" />
                                    <Text style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>Get Direction</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
               
                </View>

            </BottomSheetView>
        </BottomSheet>
    )
}