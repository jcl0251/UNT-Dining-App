import React, {useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, Text, View, Button, Linking, TouchableOpacity, ScrollView, Pressable, Modal, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from "../../firebaseConfig";
import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore"
import Ionicons from '@expo/vector-icons/Ionicons';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


type FoodItem = {
  id: string;
  name: string;
  calories: number;
  total_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrates: number;
  protein: number
  allergens: string
  ingredients: string
}

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<FoodItem[]>([]);




<ThemedView style={styles.headerText}>
        <ThemedText type="title">Plan functionality</ThemedText>
      </ThemedView>


  
  const homeButtonPress = () => {
    //navigation.navigate('Calculate'); // Navigating to the 'Calculate' tab
    navigation.navigate('index');
  };


  return (
    <SafeAreaView>
      
      <View style={styles.mainContent}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText>Under construction!</ThemedText>
      </ThemedView>
      
      <TouchableOpacity 
        style={styles.button3} //changes the style of the button to the button style at the bottom
        onPress={homeButtonPress} //takes you to calculate tab when pressed
        > 

          <Text style={styles.buttonText3}>Back Home</Text>

        </TouchableOpacity>



      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 310,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '70%',
    height: '70%', // Adjust as needed for your image size
    resizeMode: 'contain',
    position: 'absolute',
  },
  titleContainer: {
    //backgroundColor: 'lightgreen',
    flexDirection: 'row',
    gap: 8,
  },
  headerText: {
    fontSize: 130, //title font size
    color: 'white',  //title colour or color if your AmERicAn
    textAlign: 'center',
    marginTop: 60, //distance from top of screen
  },
  mainContent: {
    //backgroundColor: 'lightgreen', // Set your desired background color here
    padding: 20,
  },
  button3: {
    backgroundColor: '#808080', // Set your desired button color here
    width: 200,
    height: 100,
    borderRadius: 1, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button2: {
    backgroundColor: '#808080', // Set your desired button color here
    width: 300,
    height: 300,
    borderRadius: 1, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText3: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText2: {
    fontSize: 70,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PlanScreen;