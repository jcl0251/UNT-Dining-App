import React, {useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, Text, View, Button, Linking, TouchableOpacity, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from "../../firebaseConfig";
import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore"
import Ionicons from '@expo/vector-icons/Ionicons';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


type FoodItem = {
  id: string;
  name: string;
  calories: number;
}

const CalculateScreen: React.FC = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<FoodItem[]>([]);
  const [servings, setServings] = useState<{ [id: string]: number }>({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('breakfast'); // Default to 'breakfast'

  

  //declaration of dark mode variables
  const colorScheme = useColorScheme();  //calls the usecolorscheme library
  const isDarkMode = colorScheme === 'dark';  //bool like variable to check if the phone is in dark mode or not



  useEffect(() => {
    const fetchData = async () => {
      try {
        const colRef = collection(db, activeTab); // Change to 'lunch' or 'dinner' as needed
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(colRef);
        const docs: FoodItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          calories: doc.data().calories,
        }));
        setData(docs);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchData();
  }, [activeTab]);

   const pressedButton = () => {
  
    navigation.navigate('index');
  
  }

  const homeButtonPress = () => {
    //navigation.navigate('Calculate'); // Navigating to the 'Calculate' tab
    navigation.navigate('index');
  };

  const tabButtonStyle = (tabName: string) => ({
    ...styles.tabButton,
    backgroundColor: activeTab === tabName ? '#9edbeb' : '#808080',
  });

  const tabTextStyle = (tabName: string) => ({
    ...styles.tabText,
    color: activeTab === tabName ? 'black' : 'white',
  });

  const handleIncrement = (id: string, calories: number) => {
    setServings(prevServings => {
      const newServings = { ...prevServings, [id]: (prevServings[id] || 0) + 1 };
      calculateTotalCalories(newServings);
      return newServings;
    });
  };
  
  const handleDecrement = (id: string, calories: number) => {
    setServings(prevServings => {
      const newServings = { ...prevServings, [id]: Math.max((prevServings[id] || 0) - 1, 0) };
      calculateTotalCalories(newServings);
      return newServings;
    });
  };

  const calculateTotalCalories = (newServings: { [id: string]: number }) => {
    let total = 0;
    data.forEach(item => {
      total += (newServings[item.id] || 0) * (item.calories || 0);
    });
    setTotalCalories(total);
  };

  //before main check if user is in dark mode if yes change dynamicStyles to dark mode if no change to light mode
  const dynamicStyles = isDarkMode ? darkStyles : lightStyles;

  const resetButtonPress = () => {
    
    //stack overflow 
    const resetServings = data.reduce((acc, item) => { 
      acc[item.id] = 0;
      return acc;
    }, {} as { [id: string]: number });

    setServings(resetServings); //set the serving (numbers) to their reset default value which is 0
    setTotalCalories(0); //set the total calories to 0
  };

  //MAIN

  return (
    <View style={styles.container}>

      <Pressable style={styles.backButton} onPress={homeButtonPress}>
      <Image
          source={require('@/assets/images/back-button.png')}
          style={styles.backButtonIcon}
        />
      </Pressable>

    

      {/*TOP HEADING*/}
      <Text style={[styles.title, dynamicStyles.text]}>Calculate</Text>


      {/*TABS*/}
      <View style={styles.tabContainer}>
        <Pressable style={tabButtonStyle('breakfast')} onPress={() => setActiveTab('breakfast')}>
          <Text style={tabTextStyle('breakfast')}>Breakfast</Text>
        </Pressable>
        <Pressable style={tabButtonStyle('lunch')} onPress={() => setActiveTab('lunch')}>
          <Text style={tabTextStyle('lunch')}>Lunch</Text>
        </Pressable>
        <Pressable style={tabButtonStyle('dinner')} onPress={() => setActiveTab('dinner')}>
          <Text style={tabTextStyle('dinner')}>Dinner</Text>
        </Pressable>
      </View>


      <ScrollView style={styles.scrollBox}>
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          data.map(item => (
            <View key={item.id} style={styles.itemContainer}>
            <Text style={[styles.itemText, dynamicStyles.text]}>{item.name}</Text>
            <View style={styles.buttonContainer}>
              <Pressable onPress={() => handleDecrement(item.id, item.calories)} style={styles.decrementButton}>
                <Text style={styles.buttonText}>-</Text>
              </Pressable>

              <Text style={[styles.servingText, dynamicStyles.text]}>{servings[item.id] || 0}</Text>

              <Pressable onPress={() => handleIncrement(item.id, item.calories)} style={styles.incrementButton}>
                <Text style={styles.buttonText}>+</Text>
              </Pressable>
            </View>
          </View>
          ))
        )}
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.resetButton} //changes the style of the button to the button style at the bottom
        onPress={resetButtonPress} //takes you to calculate tab when pressed
        > 
          <Text style={styles.resetText}>Reset</Text>

        </TouchableOpacity>


      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Calories: {totalCalories}</Text>
      </View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    marginTop: 40,
  },
  mainContent: {
    padding: 50,
    //backgroundColor: 'lightgreen',
    //marginBottom: 20,
  },
  title: {
    fontSize: 50,
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    top: '-8%',
    left: '25%',
    
  },
  scrollBox: {
    flex: 1,
  },
  itemContainer: {
    padding: 1,
    marginBottom: 10,
    //backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: 'white',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10,
  },
  resetText: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  resetButton: {
    backgroundColor: '#808080',
    height: '3%',
    width: '17%',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: '#4bb153',
    //padding: 10, //removed to make the - symbol at the ceter (replaced by justify and allign)
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 45,
    borderRadius: 5, // Make it a circle
    marginHorizontal: 5,
  },
  decrementButton: {
    backgroundColor: '#f55651',
    //padding: 10, //removed to make the - symbol at the ceter (replaced by justify and allign)
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 45,
    borderRadius: 5, // Make it a circle
    marginHorizontal: 1,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
  servingText: {
    fontSize: 18,
    paddingHorizontal: 10,
    minWidth: 40, //32 Ensure a minimum width for single digits
    maxWidth: 45,
    textAlign: 'center',
  },
  totalContainer: {
    padding: 20,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    marginVertical: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    //backgroundColor: '#808080',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    position: 'static',
    //top: '50%',
    //left: '50%',
    height: 50,
    width: 50,
  },
  BreakfastButton: {
    backgroundColor: '#9edbeb',
    //padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    position: 'absolute',
    top: '10%',
    left: '0%',
    height: 50,
    width: 120,
  },
  lunchButton: {
    backgroundColor: '#f5be60',
    //padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    //marginBottom: 20,
    position: 'absolute',
    top: '10%',
    left: '33%',
    height: 50,
    width: 120,
  },
  dinnerButton: {
    backgroundColor: '#d84b51',
    //padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    //marginTop: 20,
    position: 'absolute',
    top: '10%',
    left: '66%',
    height: 50,
    width: 120,
  },
  buttonText3: {
    fontSize: 70,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonText4: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  backButtonIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  pressed: {
    backgroundColor: 'black',
    //padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    //marginBottom: 20,
    position: 'absolute',
    top: '10%',
    left: '33%',
    height: 50,
    width: 120,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

//light mode style sheet
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  text: {
    color: 'black',
  },
  errorText: {
    color: 'red',
  },
});

//dark mode style sheet
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#121212',
  },
  text: {
    color: 'white',
  },
  errorText: {
    color: '#ff6b6b',
  },
});

export default CalculateScreen;