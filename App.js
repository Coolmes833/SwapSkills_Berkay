import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';

// Ekranlar
import CreateYourAccountScreen from './screens/CreateYourAccountScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import Explore from './screens/Explore';
import Chat from './screens/Chat';
import ProfileScreen from './screens/ProfileScreen';
import ChatDetail from './screens/ChatDetail';
import SearchScreen from './screens/SearchScreen';
import ProfileDetail from './screens/ProfileDetail';
import Requests from './screens/Requests';
import SkillInfoScreen from './screens/SkillInfoScreen';
import AiHelperWithGPT from './screens/AiHelperWithGPT';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigatörü (footer)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Chat') {
            iconName = 'comment';
          } else if (route.name === 'Explore') {
            iconName = 'search';
          } else if (route.name === 'Search') {
            iconName = 'filter'; // 
          } else if (route.name === 'SignOut') {
            iconName = 'sign-out';
          }
          else if (route.name === 'Requests') {
            iconName = 'hourglass-half';
          }
          else if (route.name === 'AI Mentor GPT') {
            iconName = 'lightbulb-o'; // alternatif: 'brain', 'robot', 'book'
          }




          return <FontAwesome name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'lightgray',
        tabBarStyle: {
          backgroundColor: '#555', height: 60,
        },
        headerShown: false,

      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Chat" component={Chat} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="AI Mentor GPT" component={AiHelperWithGPT} />
      <Tab.Screen name="Requests" component={Requests} />
    </Tab.Navigator>
  );
}

// Uygulama Yapısı: Stack içinde Tab'lar
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomeScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
        <Stack.Screen name="CreateYourAccountScreen" component={CreateYourAccountScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetail} options={{ headerShown: true }} />
        <Stack.Screen name="MainApp" component={TabNavigator} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetail} options={{ headerShown: true, title: 'User Profile' }} />
        <Stack.Screen name="SkillInfo" component={SkillInfoScreen} options={{ title: 'Skill Info' }} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />



      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({});
