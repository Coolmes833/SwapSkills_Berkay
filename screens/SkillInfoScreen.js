import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    Image,
    StyleSheet,
    Linking,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { OPENAI_API_KEY } from '@env';
import { Ionicons } from '@expo/vector-icons';

const apiKey = OPENAI_API_KEY;

export default function SkillInfoScreen({ route, navigation }) {
    const { skillName } = route.params;
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorLog, setErrorLog] = useState(null);

    const fetchFromWikipedia = async (title) => {
        try {
            const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
            const data = await res.json();
            const rawText = data.extract?.trim() || '';

            if (
                rawText === '' ||
                rawText.toLowerCase().includes('may refer to') ||
                rawText.toLowerCase().includes('list of') ||
                data.type === 'disambiguation'
            ) {
                return null;
            }

            return {
                text: rawText,
                url: data.content_urls?.desktop?.page,
                image: data.thumbnail?.source,
            };
        } catch {
            return null;
        }
    };

    const fetchFromWikipediaSearch = async (query) => {
        try {
            const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=&format=json&origin=*`);
            const data = await res.json();
            const title = data.query?.search?.[0]?.title;
            if (title) return await fetchFromWikipedia(title);
        } catch {
            return null;
        }
    };

    const generateWithAI = async (skill) => {
        try {
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'user',
                            content: `Explain the skill "${skill}" in 2-3 sentences for someone who is new to the topic.`,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 300,
                }),
            });

            const data = await res.json();
            if (data.error) {
                setErrorLog(data.error.message);
                return null;
            }

            const answer = data.choices?.[0]?.message?.content || 'Yanıt alınamadı.';
            return {
                text: answer,
                url: `https://www.google.com/search?q=${encodeURIComponent(skill)}`,
                image: null,
            };
        } catch (err) {
            setErrorLog(err.message);
            return null;
        }
    };

    useEffect(() => {
        const getInfo = async () => {
            setLoading(true);
            setErrorLog(null);

            let result = await fetchFromWikipedia(skillName);
            if (!result) result = await fetchFromWikipediaSearch(skillName);
            if (!result) result = await generateWithAI(skillName);

            if (!result) {
                result = {
                    text: 'Bilgi bulunamadı. Daha yaygın bir terim deneyin.',
                    url: `https://www.google.com/search?q=${encodeURIComponent(skillName)}`,
                    image: null,
                };
            }

            setInfo(result);
            setLoading(false);
        };

        getInfo();
    }, [skillName]);

    if (loading) return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#333" />
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>


            <Text style={styles.title}>{skillName}</Text>
            {info?.image && <Image source={{ uri: info.image }} style={styles.image} />}
            <Text style={styles.text}>{info?.text}</Text>
            {info?.url && (
                <Text style={styles.link} onPress={() => Linking.openURL(info.url)}>
                    Devamını oku →
                </Text>
            )}
            {errorLog && (
                <View style={styles.errorBox}>
                    <Text style={styles.errorText}>[Hata]: {errorLog}</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#eee',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        marginBottom: 10,
    },
    backButtonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 5,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 10,
        textTransform: 'capitalize',
    },
    text: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 15,
    },
    link: {
        color: '#2196F3',
        textDecorationLine: 'underline',
        marginTop: 10,
    },
    image: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginVertical: 15,
    },
    errorBox: {
        backgroundColor: '#fee',
        padding: 10,
        marginTop: 20,
        borderRadius: 8,
        borderColor: '#f00',
        borderWidth: 1,
    },
    errorText: {
        color: '#900',
        fontSize: 12,
    },
});
