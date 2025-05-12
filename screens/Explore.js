import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { FontAwesome } from '@expo/vector-icons';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../fireBase';
import { LinearGradient } from 'expo-linear-gradient';

export default function Explore() {
    const swiperRef = useRef(null);
    const [users, setUsers] = useState([]);
    const [cardIndex, setCardIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const currentUserId = auth.currentUser?.uid;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'users'));
                const allUsers = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                const likesSnapshot = await getDocs(collection(db, 'likes', currentUserId, 'users'));
                const likedUserIds = likesSnapshot.docs.map(doc => doc.id);

                const filtered = allUsers.filter(
                    user => user.id !== currentUserId && !likedUserIds.includes(user.id)
                );

                setUsers(filtered);
            } catch (error) {
                console.error('Error fetching users:', error);
                Alert.alert('Error', 'Failed to load users.');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUserId]);

    const handleLike = async likedUserId => {
        if (!currentUserId || !likedUserId) return;

        const myRef = doc(db, 'likes', currentUserId, 'users', likedUserId);
        const reverseRef = doc(db, 'likes', likedUserId, 'users', currentUserId);
        const reverseSnap = await getDoc(reverseRef);

        if (reverseSnap.exists()) {
            const reverseStatus = reverseSnap.data().status;
            if (reverseStatus === 'pending' || reverseStatus === 'matched') {
                await Promise.all([
                    setDoc(myRef, { status: 'matched', timestamp: new Date() }),
                    setDoc(reverseRef, { status: 'matched', timestamp: new Date() }),
                ]);
                Alert.alert('Matched!', 'You have a new match!');
            }
        } else {
            await setDoc(myRef, { status: 'pending', timestamp: new Date() });
        }
    };



    const handleSwipeLeft = () => {
        if (cardIndex < users.length) {
            Alert.alert('Rejected', `${users[cardIndex]?.name || 'Unknown User'} has been rejected`);
            swiperRef.current.swipeLeft();
            setCardIndex(prevIndex => prevIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        if (cardIndex < users.length) {
            Alert.alert('Accepted', `${users[cardIndex]?.name || 'Unknown User'} has been accepted`);
            swiperRef.current.swipeRight();
            setCardIndex(prevIndex => prevIndex + 1);
        }
    };


    const isOutOfUsers = cardIndex >= users.length;

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={styles.container}>
            <Text style={styles.header}>Explore Users</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#fff" />
            ) : users.length > 0 ? (
                <View style={styles.swiperWrapper}>
                    <Swiper
                        ref={swiperRef}
                        cards={users}
                        renderCard={user =>
                            user ? (
                                <View style={styles.card}>
                                    {user.profileImage ? (
                                        <Image source={{ uri: user.profileImage }} style={styles.cardImage} />
                                    ) : (
                                        <FontAwesome name="user-circle-o" size={100} color="#ccc" />
                                    )}
                                    <Text style={styles.cardName}>{user.name || 'Unnamed User'}</Text>

                                    <Text style={styles.cardLabel}>Skills:</Text>
                                    <Text style={styles.cardText}>
                                        {Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || 'None'}
                                    </Text>

                                    <Text style={styles.cardLabel}>Want to Learn:</Text>
                                    <Text style={styles.cardText}>
                                        {Array.isArray(user.wantToLearn) ? user.wantToLearn.join(', ') : user.wantToLearn || 'None'}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.card}>
                                    <Text style={styles.cardName}>No more users available</Text>
                                </View>
                            )
                        }
                        cardIndex={cardIndex}
                        backgroundColor="transparent"
                        stackSize={3}
                        verticalSwipe={false}
                        containerStyle={{ height: 500 }}
                        cardStyle={{ alignSelf: 'center' }}
                        onSwipedRight={async index => {
                            const likedUserId = users[index]?.id;
                            await handleLike(likedUserId);
                            setCardIndex(index + 1);
                        }}
                        onSwipedLeft={index => setCardIndex(index + 1)}
                    />
                </View>
            ) : (
                <Text style={styles.noUsersText}>No users found.</Text>
            )}

            {isOutOfUsers && !loading && (
                <View style={styles.outOfUsersContainer}>
                    <Text style={styles.outOfUsersText}>You're all caught up!</Text>
                </View>
            )}

            {!loading && users.length > 0 && !isOutOfUsers && (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity style={styles.rejectButton} onPress={handleSwipeLeft}>
                        <FontAwesome name="times" size={30} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleSwipeRight}>
                        <FontAwesome name="check" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 16,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center',
    },
    swiperWrapper: {
        height: 500,
        width: '100%',
    },
    card: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffffee',
        borderRadius: 15,
        width: 300,
        height: 420,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        padding: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        alignSelf: 'center',
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 60,
        marginBottom: 12,
    },
    cardName: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#222',
    },
    cardLabel: {
        fontWeight: '600',
        marginTop: 8,
        fontSize: 14,
        color: '#555',
    },
    cardText: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    outOfUsersContainer: {
        marginTop: 40,
        padding: 20,
        backgroundColor: '#ffffff20',
        borderRadius: 10,
    },
    outOfUsersText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff',
    },
    noUsersText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        position: 'absolute',
        bottom: 60,
    },
    rejectButton: {
        backgroundColor: '#db4437',
        padding: 20,
        borderRadius: 50,
        elevation: 4,
    },
    acceptButton: {
        backgroundColor: '#34a853',
        padding: 20,
        borderRadius: 50,
        elevation: 4,
    },
});
