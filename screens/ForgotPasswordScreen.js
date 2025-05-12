import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
} from 'react-native';
import {
    sendPasswordResetEmail,
    fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { auth } from '../fireBase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');

    const handlePasswordReset = async () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        try {
            const methods = await fetchSignInMethodsForEmail(auth, normalizedEmail);

            if (!methods || methods.length === 0) {
                await sendPasswordResetEmail(auth, normalizedEmail);
                Alert.alert('Notice', 'If your email is registered, a reset link has been sent.');
                navigation.goBack();
                return;
            }

            if (!methods.includes('password')) {
                Alert.alert('Unsupported Login', 'This account uses a different login method (e.g. Google).');
                return;
            }

            await sendPasswordResetEmail(auth, normalizedEmail);
            Alert.alert('Success', 'A reset link has been sent to your email.');
            navigation.goBack();
        } catch (error) {
            console.error('Error:', error.code, error.message);

            let message = 'An unexpected error occurred. Please try again.';
            if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address format.';
            } else if (error.code === 'auth/network-request-failed') {
                message = 'Network error. Please check your internet connection.';
            }

            Alert.alert('Error', message);
        }
    };

    return (
        <LinearGradient colors={['#5c83b3', '#3b5998', '#1f2f5a']} style={{ flex: 1 }}>
            <View style={styles.container}>
                <Text style={styles.title}>Reset Your Password</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter your registered email"
                    placeholderTextColor="#f0f0f0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                <TouchableOpacity style={styles.button} onPress={handlePasswordReset}>
                    <Text style={styles.buttonText}>Send Reset Link</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 35,
        color: '#fff',
    },
    input: {
        backgroundColor: '#ffffff90',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: Platform.OS === 'ios' ? 15 : 12,
        marginBottom: 20,
        fontSize: 16,
        color: '#fff',
    },
    button: {
        backgroundColor: '#5cb85c',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 20,
    },
    backText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});
