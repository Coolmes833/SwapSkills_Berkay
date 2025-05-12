import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, StyleSheet, Linking, ScrollView } from 'react-native';

export default function SkillInfoScreen({ route }) {
    const { skillName } = route.params;
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkillInfo = async () => {
            try {
                const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(skillName)}&format=json&no_redirect=1`);
                const data = await response.json();
                setInfo({
                    text: data.AbstractText,
                    url: data.AbstractURL,
                    image: data.Image,
                });
            } catch (error) {
                setInfo({ text: 'Failed to fetch information.' });
            } finally {
                setLoading(false);
            }
        };

        fetchSkillInfo();
    }, [skillName]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{skillName}</Text>
            {info.image ? <Image source={{ uri: info.image }} style={styles.image} /> : null}
            <Text style={styles.text}>{info.text || 'No description found.'}</Text>
            {info.url ? (
                <Text style={styles.link} onPress={() => Linking.openURL(info.url)}>
                    More on DuckDuckGo
                </Text>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#fff',
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});
