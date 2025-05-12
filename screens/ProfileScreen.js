import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Alert, Image, ScrollView, Linking, Animated
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAuth, signOut } from 'firebase/auth';
import { auth, db } from '../fireBase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../CloudinaryUpload.js';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen({ navigation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [skillsInput, setSkillsInput] = useState('');
    const [skills, setSkills] = useState([]);
    const [urlInput, setUrlInput] = useState('');
    const [urls, setUrls] = useState([]);
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [location, setLocation] = useState(null);
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [userId, setUserId] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [wantToLearnInput, setWantToLearnInput] = useState('');
    const [wantToLearn, setWantToLearn] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const toastOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const currentUser = getAuth().currentUser;
        if (currentUser) setUserId(currentUser.uid);
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId) return;
            try {
                const ref = doc(db, 'users', userId);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setSkills(Array.isArray(data.skills) ? data.skills : []);
                    setUrls(Array.isArray(data.urls) ? data.urls : []);
                    setAge(data.age || '');
                    setGender(data.gender || '');
                    setLocation(data.location || null);
                    setCity(data.city || '');
                    setCountry(data.country || '');
                    setProfileImage(data.profileImage || null);
                    setWantToLearn(Array.isArray(data.wantToLearn) ? data.wantToLearn : []);
                }
            } catch (err) {
                console.error('Error loading profile:', err);
            }
        };
        fetchProfile();
    }, [userId]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Location access is required.');
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
        })();
    }, []);

    const handleAddSkill = () => {
        if (skillsInput.trim()) {
            setSkills([...skills, skillsInput.trim()]);
            setSkillsInput('');
        }
    };

    const handleRemoveSkill = (index) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const handleAddUrl = () => {
        if (urlInput.trim().startsWith('http://') || urlInput.trim().startsWith('https://')) {
            setUrls([...urls, urlInput.trim()]);
            setUrlInput('');
        } else {
            Alert.alert('Invalid URL', 'Link must start with http:// or https://');
        }
    };

    const handleRemoveUrl = (index) => {
        setUrls(urls.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        if (!userId || !name || !description || skills.length === 0) {
            Alert.alert('Please fill in all required fields.');
            return;
        }
        try {
            await setDoc(doc(db, 'users', userId), {
                name,
                description,
                skills,
                urls,
                age,
                gender,
                location,
                city,
                country,
                profileImage,
                wantToLearn,
            });

            setShowToast(true);
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(toastOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setShowToast(false));
                }, 2000);
            });
        } catch (err) {
            console.error('Save error:', err);
            Alert.alert('Error', 'Failed to save profile.');
        }
    };

    const handleImagePick = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission denied', 'Gallery access is required.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            try {
                const uploaded = await uploadToCloudinary(uri);
                setProfileImage(uploaded);
            } catch (e) {
                Alert.alert('Upload failed');
            }
        }
    };

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>MY PROFILE</Text>

                <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick}>
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} style={styles.profileImage} />
                    ) : (
                        <FontAwesome name="camera" size={30} color="#000" />
                    )}
                </TouchableOpacity>

                <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#f0f0f0" value={name} onChangeText={setName} />
                <TextInput style={[styles.input, styles.textArea]} placeholder="Description" placeholderTextColor="#f0f0f0" value={description} onChangeText={setDescription} multiline />
                <TextInput style={styles.input} placeholder="City" placeholderTextColor="#f0f0f0" value={city} onChangeText={setCity} />
                <TextInput style={styles.input} placeholder="Country" placeholderTextColor="#f0f0f0" value={country} onChangeText={setCountry} />
                <TextInput style={styles.input} placeholder="Age" placeholderTextColor="#f0f0f0" keyboardType="numeric" value={age} onChangeText={setAge} />
                <Picker selectedValue={gender} onValueChange={setGender} style={styles.picker}>
                    <Picker.Item label="Select Gender" value="" />
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                </Picker>

                <View style={styles.skillInputRow}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Add a skill" placeholderTextColor="#f0f0f0" value={skillsInput} onChangeText={setSkillsInput} onSubmitEditing={handleAddSkill} />
                    <TouchableOpacity onPress={handleAddSkill} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                    {skills.map((skill, index) => (
                        <TouchableOpacity key={index} style={styles.tag} onPress={() => handleRemoveSkill(index)}>
                            <Text style={styles.tagText}>{skill} ✕</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.skillInputRow}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Want to Learn" placeholderTextColor="#f0f0f0" value={wantToLearnInput} onChangeText={setWantToLearnInput} onSubmitEditing={() => {
                        if (wantToLearnInput.trim()) {
                            setWantToLearn([...wantToLearn, wantToLearnInput.trim()]);
                            setWantToLearnInput('');
                        }
                    }} />
                    <TouchableOpacity onPress={() => {
                        if (wantToLearnInput.trim()) {
                            setWantToLearn([...wantToLearn, wantToLearnInput.trim()]);
                            setWantToLearnInput('');
                        }
                    }} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                    {wantToLearn.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.tag} onPress={() => setWantToLearn(wantToLearn.filter((_, i) => i !== index))}>
                            <Text style={styles.tagText}>{item} ✕</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.skillInputRow}>
                    <TextInput style={[styles.input, { flex: 1 }]} placeholder="Add a link (https://...)" placeholderTextColor="#f0f0f0" value={urlInput} onChangeText={setUrlInput} onSubmitEditing={handleAddUrl} />
                    <TouchableOpacity onPress={handleAddUrl} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.tagsContainer}>
                    {urls.map((url, index) => (
                        <TouchableOpacity key={index} style={styles.tag} onPress={() => Linking.openURL(url)}>
                            <Text style={styles.tagText}>{url.length > 30 ? url.slice(0, 30) + '...' : url}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {location && (
                    <>
                        <MapView style={styles.map} region={{ ...location, latitudeDelta: 0.005, longitudeDelta: 0.005 }}>
                            <Marker coordinate={location} title="Your Location" />
                        </MapView>
                        <Text style={styles.locationText}>
                            You are here: {city || 'Your City'}, {country || 'Your Country'}
                        </Text>
                    </>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={async () => {
                        try {
                            await signOut(auth);
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'WelcomeScreen' }],
                            });
                        } catch (err) {
                            Alert.alert('Logout Error', err.message);
                        }
                    }}
                >
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                {showToast && (
                    <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
                        <Text style={styles.toastText}>✅ Profile updated!</Text>
                    </Animated.View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: 'transparent' },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', color: '#fff' },
    profileImageContainer: {
        alignSelf: 'center',
        marginBottom: 25,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ffffff30',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
    },
    profileImage: { width: 120, height: 120, borderRadius: 60 },
    input: {
        backgroundColor: '#ffffff90',
        padding: 14,
        borderRadius: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#fff',
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    skillInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    addButton: {
        backgroundColor: '#4285F4',
        padding: 12,
        borderRadius: 10,
        marginLeft: 10,
        elevation: 3,
    },
    addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
    tag: {
        backgroundColor: '#ffffff40',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: { fontSize: 14, color: '#fff' },
    picker: { backgroundColor: '#ffffff90', borderRadius: 12, marginBottom: 15, color: '#fff' },
    map: { width: '100%', height: 200, marginBottom: 10, borderRadius: 12 },
    locationText: {
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 14,
        fontStyle: 'italic',
    },
    saveButton: {
        backgroundColor: '#ff7f50',
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
        marginBottom: 30,
        elevation: 4,
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    toast: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: '#333',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        zIndex: 999,
    },
    toastText: { color: '#fff', fontWeight: 'bold', },
    logoutButton: {
        marginTop: 20,
        backgroundColor: '#ff5252',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

