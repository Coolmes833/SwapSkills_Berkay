import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AiHelperWithGPT() {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [animatedValue] = useState(new Animated.Value(0));

    const apiKey = "";

    const handleAskGPT = async () => {
        if (!input.trim()) return;

        setLoading(true);
        setResponse('');

        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: input }],
                    temperature: 0.7,
                    max_tokens: 800,
                }),
            });

            const data = await res.json();
            const answer = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || 'Yanıt alınamadı.';
            setResponse(answer.trim());
        } catch (error) {
            console.error(error);
            setResponse('Bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>AI Mentor with ChatGPT</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Ask me anything (e.g. How to learn Python?)"
                    value={input}
                    onChangeText={setInput}
                    placeholderTextColor="#f0f0f0"
                />

                <TouchableOpacity style={styles.button} onPress={handleAskGPT}>
                    <Text style={styles.buttonText}> Ask SwapSkill AI Mentor</Text>
                </TouchableOpacity>

                {loading && (
                    <View style={styles.loadingWrapper}>
                        <ActivityIndicator size="large" color="#ffffff" />
                        <Text style={styles.typingText}>AI is typing...</Text>
                    </View>
                )}

                {response !== '' && (
                    <View style={styles.responseContainer}>
                        <Text style={styles.response}>{response}</Text>
                    </View>
                )}
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    input: {
        backgroundColor: '#ffffff90',
        padding: 14,
        borderRadius: 12,
        fontSize: 16,
        color: '#fff',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#ff7f50',
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    typingText: {
        marginLeft: 10,
        color: '#f0f0f0',
        fontStyle: 'italic',
    },
    responseContainer: {
        marginTop: 24,
        backgroundColor: '#ffffff20',
        padding: 16,
        borderRadius: 12,
    },
    response: {
        fontSize: 16,
        lineHeight: 22,
        color: '#fff',
    },
});