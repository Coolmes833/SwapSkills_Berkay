import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Modal, ActivityIndicator, Image, ScrollView, Pressable, Linking } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../fireBase';
import { LinearGradient } from 'expo-linear-gradient';

export default function SearchScreen({ navigation }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalSkill, setModalSkill] = useState('');
    const [modalInfo, setModalInfo] = useState(null);
    const [loadingInfo, setLoadingInfo] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const snapshot = await getDocs(collection(db, 'users'));
            const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            const filtered = users.filter((user) => {
                const skills = Array.isArray(user.skills) ? user.skills.join(' ').toLowerCase() : (user.skills || '').toLowerCase();
                return skills.includes(query.toLowerCase());
            });

            setResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    const handleSkillPress = async (skill) => {
        setModalVisible(true);
        setModalSkill(skill);
        setLoadingInfo(true);
        try {
            const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(skill)}&format=json&no_redirect=1`);
            const data = await response.json();
            setModalInfo({
                text: data.AbstractText,
                url: data.AbstractURL,
                image: data.Image,
            });
        } catch (error) {
            setModalInfo({ text: 'Bilgi alınamadı.' });
        } finally {
            setLoadingInfo(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name || 'Unnamed'}</Text>
            {item.description && <Text style={styles.skills}>{item.description}</Text>}

            <View style={styles.skillsContainer}>
                {(Array.isArray(item.skills) ? item.skills : (item.skills || '').split(',')).map((skill, index) => (
                    <TouchableOpacity key={index} style={styles.skillChip} onPress={() => handleSkillPress(skill.trim())}>
                        <Text style={styles.skillText}>{skill.trim()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: item.id })} style={styles.viewProfileButton}>
                <Text style={styles.viewProfileText}>View Profile</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Search by Skill</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter a skill (e.g. React, Cyber)"
                    placeholderTextColor="#f0f0f0"
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={handleSearch}
                />

                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.empty}>No results yet</Text>}
                />

                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <ScrollView>
                                <Text style={styles.modalTitle}>{modalSkill}</Text>
                                {loadingInfo ? (
                                    <ActivityIndicator size="large" color="#0000ff" />
                                ) : (
                                    <>
                                        {modalInfo?.image ? <Image source={{ uri: modalInfo.image }} style={styles.modalImage} /> : null}
                                        <Text style={styles.modalText}>{modalInfo?.text || 'No description found.'}</Text>
                                        {modalInfo?.url ? (
                                            <Text style={styles.modalLink} onPress={() => Linking.openURL(modalInfo.url)}>
                                                Devamını oku →
                                            </Text>
                                        ) : null}
                                    </>
                                )}
                                <Pressable style={styles.closeButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.closeButtonText}>Kapat</Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
        color: '#fff',
    },
    input: {
        backgroundColor: '#ffffff90',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
        fontSize: 16,
        color: '#fff',
    },
    userItem: {
        backgroundColor: '#ffffffcc',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
    },
    skills: {
        fontSize: 14,
        color: '#555',
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
    },
    skillChip: {
        backgroundColor: '#d0e8ff',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 6,
        marginBottom: 6,
    },
    skillText: {
        fontSize: 14,
        color: '#005c99',
    },
    viewProfileButton: {
        marginTop: 10,
        alignSelf: 'flex-start',
        backgroundColor: '#4caf50',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
    },
    viewProfileText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '85%',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        textTransform: 'capitalize',
    },
    modalText: {
        fontSize: 15,
        textAlign: 'center',
        marginVertical: 10,
    },
    modalLink: {
        color: '#2196F3',
        textAlign: 'center',
        textDecorationLine: 'underline',
        marginBottom: 10,
    },
    modalImage: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        resizeMode: 'contain',
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: '#4caf50',
        paddingVertical: 10,
        borderRadius: 8,
    },
    closeButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 'bold',
    },
});
