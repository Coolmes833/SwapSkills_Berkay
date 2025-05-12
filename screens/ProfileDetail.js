import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Image, ActivityIndicator,
    TouchableOpacity, Alert, ScrollView, Linking
} from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../fireBase';
import { getAuth } from 'firebase/auth';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileDetail({ route, navigation }) {
    const { userId } = route.params;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentLocation, setCurrentLocation] = useState(null);
    const currentUserId = getAuth().currentUser?.uid;

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                setCurrentLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }
        })();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const docRef = doc(db, 'users', userId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUser(docSnap.data());
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const getDistanceInKm = () => {
        if (!user?.location || !currentLocation) return null;
        const R = 6371;
        const dLat = (user.location.latitude - currentLocation.latitude) * (Math.PI / 180);
        const dLon = (user.location.longitude - currentLocation.longitude) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(currentLocation.latitude * (Math.PI / 180)) *
            Math.cos(user.location.latitude * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    const handleLike = async () => {
        if (!currentUserId || !userId) return;

        const myRef = doc(db, 'likes', currentUserId, 'users', userId);
        const reverseRef = doc(db, 'likes', userId, 'users', currentUserId);
        const existingLike = await getDoc(myRef);
        if (existingLike.exists()) {
            Alert.alert('Already Processed', 'You have already made a decision for this user.');
            return;
        }

        const reverseSnap = await getDoc(reverseRef);
        if (reverseSnap.exists() && reverseSnap.data().status === 'pending') {
            await Promise.all([
                setDoc(myRef, { status: 'matched', timestamp: new Date() }),
                setDoc(reverseRef, { status: 'matched', timestamp: new Date() }),
            ]);
            Alert.alert('Matched!', 'You have a new match!');
        } else {
            await setDoc(myRef, { status: 'pending', timestamp: new Date() });
            Alert.alert('Liked!', 'User has been added to pending list.');
        }
    };

    const openURL = async (url) => {
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('Invalid Link', 'Cannot open this URL.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open the link.');
        }
    };

    if (loading) return <ActivityIndicator size="large" color="#fff" style={{ flex: 1 }} />;
    if (!user) return <View style={styles.container}><Text>User not found.</Text></View>;

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                {user.profileImage ? (
                    <Image source={{ uri: user.profileImage }} style={styles.image} />
                ) : (
                    <Text style={styles.initial}>{user.name?.charAt(0) || '?'}</Text>
                )}
                <Text style={styles.name}>{user.name}</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{user.description || 'No description provided'}</Text>

                    {Array.isArray(user.skills) && user.skills.length > 0 && (
                        <>
                            <Text style={styles.label}>Skills:</Text>
                            <View style={styles.tagContainer}>
                                {user.skills.map((skill, idx) => (
                                    <Text key={idx} style={styles.tag}>{skill}</Text>
                                ))}
                            </View>
                        </>
                    )}

                    {Array.isArray(user.wantToLearn) && user.wantToLearn.length > 0 && (
                        <>
                            <Text style={styles.label}>Wants to Learn:</Text>
                            <View style={styles.tagContainer}>
                                {user.wantToLearn.map((skill, idx) => (
                                    <Text key={idx} style={styles.tag}>{skill}</Text>
                                ))}
                            </View>
                        </>
                    )}

                    {Array.isArray(user.urls) && user.urls.length > 0 && (
                        <>
                            <Text style={styles.label}>Links:</Text>
                            {user.urls.map((url, idx) => (
                                <TouchableOpacity key={idx} onPress={() => openURL(url)}>
                                    <Text style={styles.url}>{url}</Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}

                    {user.age && <Text style={styles.value}>Age: {user.age}</Text>}
                    {user.gender && <Text style={styles.value}>Gender: {user.gender}</Text>}

                    {user.location && (
                        <>
                            <Text style={styles.label}>Location:</Text>
                            {(user.city || user.country) && (
                                <Text style={styles.cityCountry}>
                                    {user.city}{user.city && user.country ? ', ' : ''}{user.country}
                                </Text>
                            )}
                            <MapView
                                style={styles.map}
                                region={{
                                    latitude: user.location.latitude,
                                    longitude: user.location.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                            >
                                <Marker coordinate={user.location} />
                            </MapView>
                            {getDistanceInKm() && (
                                <Text style={styles.distance}>~ {getDistanceInKm()} km away</Text>
                            )}
                        </>
                    )}
                </View>

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.rejectButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>✗</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleLike}>
                        <Text style={styles.buttonText}>✓</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    image: {
        width: 140,
        height: 140,
        borderRadius: 70,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: '#fff',
    },
    initial: {
        fontSize: 64,
        fontWeight: 'bold',
        backgroundColor: '#ccc',
        color: '#fff',
        width: 140,
        height: 140,
        borderRadius: 70,
        textAlign: 'center',
        lineHeight: 140,
        marginBottom: 20,
    },
    name: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff',
    },
    infoCard: {
        backgroundColor: '#ffffffee',
        padding: 20,
        borderRadius: 12,
        width: '100%',
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
    },
    value: {
        fontSize: 15,
        marginTop: 4,
        color: '#444',
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 4,
    },
    tag: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
        fontSize: 14,
    },
    url: {
        color: '#1e88e5',
        textDecorationLine: 'underline',
        marginTop: 4,
    },
    map: {
        width: '100%',
        height: 180,
        marginTop: 10,
        borderRadius: 8,
    },
    distance: {
        marginTop: 8,
        color: '#1f2f5a',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    cityCountry: {
        fontSize: 15,
        color: '#333',
        marginTop: 4,
        marginBottom: 4,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '60%',
        marginBottom: 30,
    },
    rejectButton: {
        backgroundColor: '#db4437',
        padding: 15,
        borderRadius: 50,
        width: 60,
        alignItems: 'center',
        elevation: 3,
    },
    acceptButton: {
        backgroundColor: '#34a853',
        padding: 15,
        borderRadius: 50,
        width: 60,
        alignItems: 'center',
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
});
