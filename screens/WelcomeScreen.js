import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    StatusBar,
    Image,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../fireBase';
import { FontAwesome } from '@expo/vector-icons';

export default function WelcomeScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            Alert.alert('Welcome!', `Logged in as ${userCredential.user.email}`);
            navigation.navigate('MainApp');
        } catch (error) {
            Alert.alert('Sign In Error', error.message);
        }
    };

    return (
        <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4c669f" />
            <Image source={require('../assets/logo.webp')} style={styles.image} />
            <Text style={styles.header}>Welcome to SwapSkill Network</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#f0f0f0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Password"
                        placeholderTextColor="#f0f0f0"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <FontAwesome
                            name={showPassword ? 'eye-slash' : 'eye'}
                            size={22}
                            color="#f0f0f0"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
                    <Text style={styles.forgotText}>Forgot your password?</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={{ height: 15 }} /> {/* Butonlar arası boşluk */}

            <TouchableOpacity
                style={styles.googleSignInButton}
                onPress={() => navigation.navigate('MainApp')}
            >
                <Text style={styles.googleSignInButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            <Text style={styles.justText}>Don't have an account?</Text>
            <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => navigation.navigate('CreateYourAccountScreen')}
            >
                <Text style={styles.createAccountButtonText}>Create Your Account Now</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 40,
        textAlign: 'center',
    },
    image: {
        height: 300,
        width: '100%',
        marginBottom: 30,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#ffffff80',
        paddingLeft: 15,
        borderRadius: 8,
        fontSize: 16,
        color: '#fff',
        height: 50,
        marginBottom: 15,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff80',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
    },
    passwordInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    forgotText: {
        color: '#eee',
        fontSize: 13,
        textAlign: 'right',
        marginTop: 8,
    },
    signInButton: {
        backgroundColor: '#333',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        width: '100%',
        alignItems: 'center',
    },
    signInButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    googleSignInButton: {
        backgroundColor: '#4285F4',
        paddingVertical: 15,
        paddingHorizontal: 50,
        marginBottom: 35,
        width: '100%',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleSignInButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    justText: {
        color: 'white',
        marginBottom: 10,
    },
    createAccountButton: {
        backgroundColor: '#ff7f50',
        paddingVertical: 15,
        paddingHorizontal: 50,
        borderRadius: 25,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    createAccountButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
