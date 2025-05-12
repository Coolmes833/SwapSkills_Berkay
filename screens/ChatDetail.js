import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, FlatList,
    StyleSheet, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import {
    collection, query, orderBy, onSnapshot,
    addDoc, serverTimestamp, doc, updateDoc,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../fireBase';
import { getAuth } from 'firebase/auth';
import { formatDistanceToNow } from 'date-fns';

export default function ChatDetail({ route, navigation }) {
    const { chatId, currentUserId, userName, receiverId } = route.params;
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [isReceiverOnline, setIsReceiverOnline] = useState(false);
    const [lastSeen, setLastSeen] = useState(null);
    const flatListRef = useRef();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <TouchableOpacity onPress={() => navigation.navigate('ProfileDetail', { userId: receiverId })}>
                    <Text style={styles.headerName}>{userName}</Text>
                </TouchableOpacity>
            )
        });
    }, [userName, receiverId]);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'status', receiverId), (docSnap) => {
            const data = docSnap.data();
            if (data) {
                setIsReceiverOnline(data.state === 'online');
                setLastSeen(data.last_changed?.toDate());
            }
        });
        return () => unsub();
    }, [receiverId]);

    useEffect(() => {
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('createdAt', 'asc')
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsub();
    }, [chatId]);

    const sendMessage = async () => {
        const trimmed = inputMessage.trim();
        if (!trimmed) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');

        if (editingMessageId) {
            await updateDoc(doc(messagesRef, editingMessageId), {
                message: trimmed,
                edited: true,
            });
            setEditingMessageId(null);
        } else {
            await addDoc(messagesRef, {
                senderId: currentUserId,
                message: trimmed,
                createdAt: serverTimestamp(),
            });
        }

        setInputMessage('');
    };

    const handleEdit = (messageId, currentText) => {
        setEditingMessageId(messageId);
        setInputMessage(currentText);
    };

    const handleDelete = async (messageId) => {
        Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                onPress: async () => {
                    await deleteDoc(doc(db, 'chats', chatId, 'messages', messageId));
                },
                style: 'destructive',
            },
        ]);
    };

    const renderItem = ({ item }) => {
        const isMine = item.senderId === currentUserId;
        const createdAt = item.createdAt?.toDate?.();
        const dateText = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : '';

        return (
            <TouchableOpacity
                onLongPress={() => {
                    if (isMine) {
                        Alert.alert('Message Options', '', [
                            { text: 'Edit', onPress: () => handleEdit(item.id, item.message) },
                            { text: 'Delete', onPress: () => handleDelete(item.id), style: 'destructive' },
                            { text: 'Cancel', style: 'cancel' },
                        ]);
                    }
                }}
                style={[
                    styles.messageContainer,
                    isMine ? styles.myMessage : styles.otherMessage,
                ]}
            >
                <Text style={styles.messageText}>
                    {item.message}{item.edited ? ' (edited)' : ''}
                </Text>
                <Text style={styles.timestamp}>{dateText}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
        >
            <View style={styles.headerBar}>
                <Text style={styles.statusText}>
                    {isReceiverOnline
                        ? '🟢 Online'
                        : lastSeen
                            ? `Last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}`
                            : 'Offline'}
                </Text>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 12 }}
            />

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChangeText={setInputMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Text style={styles.sendButtonText}>
                        {editingMessageId ? 'Update' : 'Send'}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    headerBar: {
        paddingHorizontal: 15,
        paddingVertical: 6,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    statusText: {
        fontSize: 13,
        color: '#333',
    },
    headerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    messageContainer: {
        marginVertical: 4,
        padding: 10,
        borderRadius: 10,
        maxWidth: '75%',
    },
    myMessage: {
        backgroundColor: '#DCF8C6',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: '#E5E5E5',
        alignSelf: 'flex-start',
    },
    messageText: { fontSize: 16 },
    timestamp: {
        fontSize: 12,
        color: '#777',
        marginTop: 4,
        textAlign: 'right',
    },
    inputContainer: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        backgroundColor: '#eee',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#4c669f',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});