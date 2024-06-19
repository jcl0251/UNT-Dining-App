import React from 'react';
import { StyleSheet, Image, Platform, Text, View, Button, Linking, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Ionicons from '@expo/vector-icons/Ionicons';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


//Ionicons size={310} name="code-slash" style={styles.headerImage}
//headerImage={<Text style={styles.headerText}>UNT</Text>}

//<Image source={require('@/assets/images/unt-banner.png')} style={{ alignSelf: 'center' }} />

/*
headerBackgroundColor={{ light: '#38CB82', dark: '#198450' }}
headerImage={<Image source={require('@/assets/images/unt-banner.png')} style={styles.headerImage}>
*/
export default function TabTwoScreen() {
  
  const navigation = useNavigation();
  
  const calculateButtonPress = () => {
    //navigation.navigate('Calculate'); // Navigating to the 'Calculate' tab
    navigation.navigate('Calculate');
  };
  const planButtonPress = () => {
    //navigation.navigate('Calculate'); // Navigating to the 'Calculate' tab
    navigation.navigate('Plan');
  };
  
  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: '#5aaf7e', dark: '#198450' }}
      headerImage={(
      <View style={styles.headerContainer}>
        <Image
          source={require('@/assets/images/unt-banner.png')}
          style={styles.headerImage}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.headerText}></Text>
        </View>
      </View>
    )}
  >
      
      <View style={styles.mainContent}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">UNT</ThemedText>
      </ThemedView>
      
      <ThemedText>This app is designed to improve the UNT dining experience.</ThemedText>

      <ExternalLink href="https://dining.unt.edu/menus-and-allergens/">
          <ThemedText type="link">Link to UNT Dining Website</ThemedText>
        </ExternalLink>

      
      
        <Button
          title="Calculate Tab"
          onPress={() => calculateButtonPress()}
        />

        <TouchableOpacity 
        style={styles.button1} //changes the style of the button to the button style at the bottom
        onPress={calculateButtonPress} //takes you to calculate tab when pressed
        > 

          <Text style={styles.buttonText1}>Calculate</Text>

        </TouchableOpacity>
      
        <TouchableOpacity 
        style={styles.button2} //changes the style of the button to the button style at the bottom
        onPress={planButtonPress} //takes you to calculate tab when pressed
        > 

          <Text style={styles.buttonText2}>Plan</Text>

        </TouchableOpacity>

      </View>
    </ParallaxScrollView>
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
    backgroundColor: 'lightgreen',
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
    backgroundColor: 'lightgreen', // Set your desired background color here
    padding: 20,
  },
  button1: {
    backgroundColor: '#04843c', // Set your desired button color here
    width: 300,
    height: 300,
    borderRadius: 150, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  button2: {
    backgroundColor: '#808080', // Set your desired button color here
    width: 300,
    height: 300,
    borderRadius: 150, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText1: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText2: {
    fontSize: 70,
    color: 'white',
    fontWeight: 'bold',
  },
});
