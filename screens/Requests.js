// screens/Requests.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { db } from '../fireBase';
import { doc, getDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

export default function Requests({ navigation }) {
    const [requests, setRequests] = useState([]);
    const currentUserId = getAuth().currentUser?.uid;

    useEffect(() => {
        if (!currentUserId) return;

        const unsubscribe = onSnapshot(collection(db, 'likes', currentUserId, 'users'), async (snapshot) => {
            const updates = [];

            for (const docSnap of snapshot.docs) {
                const otherUserId = docSnap.id;
                const myStatus = docSnap.data().status;

                if (myStatus !== 'pending') continue;

                const userRef = doc(db, 'users', otherUserId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    const userData = userSnap.data();

                    updates.push({
                        id: otherUserId,
                        name: userData.name,
                    });
                }
            }

            setRequests(updates);
        });

        return () => unsubscribe();
    }, [currentUserId]);

    const handleCancelRequest = async (userId) => {
        Alert.alert(
            'Cancel Request',
            'Are you sure you want to cancel this request?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, 'likes', currentUserId, 'users', userId));
                            Alert.alert('Cancelled', 'Your request has been cancelled.');
                        } catch (error) {
                            console.error('Failed to cancel request:', error);
                            Alert.alert('Error', 'Could not cancel the request.');
                        }
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate('ProfileDetail', { userId: item.id, readonly: true })}>
                <FontAwesome name="user" size={24} color="#fff" style={styles.avatar} />
                <Text style={styles.userName}>{item.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelRequest(item.id)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={styles.gradient}>
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.header}>Pending Requests</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Info', 'These are requests you have sent but not yet matched.')}>
                        <FontAwesome name="question-circle" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {requests.length > 0 ? (
                    <FlatList data={requests} keyExtractor={(item) => item.id} renderItem={renderItem} />
                ) : (
                    <Text style={styles.emptyText}>No pending requests.</Text>
                )}
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    header: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    card: {
        backgroundColor: '#ffffff22',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        marginRight: 12,
    },
    userName: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: '#ff5252',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        elevation: 3,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#fff',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        fontStyle: 'italic',
    },
});
