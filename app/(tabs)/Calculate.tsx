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
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type FoodItem = {
  id: string;
  name: string;
  calories: number;
  total_fat: number;
  cholesterol: number;
  sodium: number;
  total_carbohydrates: number;
  protein: number
}



const CalculateScreen: React.FC = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<FoodItem[]>([]);
  const [servings, setServings] = useState<{ [id: string]: number }>({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  //declaration of dark mode variables
  const colorScheme = useColorScheme();  //calls the usecolorscheme library
  const isDarkMode = colorScheme === 'dark';  //bool like variable to check if the phone is in dark mode or not

  useEffect(() => {
    const fetchData = async () => {
      try {
        const colRef = collection(db, 'breakfast'); // Change to 'lunch' or 'dinner' as needed
        const snapshot: QuerySnapshot<DocumentData> = await getDocs(colRef);
        const docs: FoodItem[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          calories: doc.data().calories,
          total_fat: doc.data().total_fat,
          cholesterol: doc.data().cholesterol,
          sodium: doc.data().sodium,
          total_carbohydrates: doc.data().total_carbohydrates,
          protein: doc.data().protein,

        }));
        setData(docs);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const homeButtonPress = () => {
    //navigation.navigate('Calculate'); // Navigating to the 'Calculate' tab
    navigation.navigate('index');
  };

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

  const calculateTotalCalories = (newServings: { [id: string]: number }) => { // Key-value pair of food ID and its number of servings
    let total = 0;
    data.forEach(item => {
      total += (newServings[item.id] || 0) * (item.calories || 0);
    });
    setTotalCalories(total);
  };

  const handleFoodPress = (food: FoodItem) => {
    setSelectedFood(food);
    setModalOpen(true);
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
      {/*TOP HEADING*/}
      <ThemedText style={[styles.title, dynamicStyles.text]}>Calculate</ThemedText>

      
      
      <Pressable style={styles.button3} onPress={homeButtonPress}>
        <Text style={styles.buttonText3}>Back Home</Text>
      </Pressable>

      <ScrollView style={styles.scrollBox}>
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          data.map(item => (
            <View key={item.id} style={styles.itemContainer}>
              <Pressable onPress={() => handleFoodPress(item)}>
                <Text style={styles.itemText}>{item.name}</Text>
              </Pressable>

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

      
      <Pressable 
        style={styles.resetButton} //changes the style of the button to the button style at the bottom
        onPress={resetButtonPress} //takes you to calculate tab when pressed
        > 
          <Text style={styles.resetText}>Reset</Text>

      </Pressable>

      <Modal visible={modalOpen} animationType='slide'>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <MaterialIcons
                name='close'
                size={24}
                style={styles.modalToggle}
                onPress = {() => setModalOpen(false)}
              />
              {selectedFood && (
                <>
                  <Text style={styles.foodName}>{selectedFood.name}</Text>
                  <Text>Calories: {selectedFood.calories}</Text>
                  <Text>Total Fat: {selectedFood.total_fat}g</Text>
                  <Text>Cholesterol: {selectedFood.cholesterol}mg</Text>
                  <Text>Sodium: {selectedFood.sodium}mg</Text>
                  <Text>Total Carbohydrates: {selectedFood.total_carbohydrates}g</Text>
                  <Text>Protein: {selectedFood.protein}g</Text>
                </>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
      
      

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Calories: {totalCalories}</Text>
      </View>

      <Pressable style={styles.button3} onPress={homeButtonPress}>
        <Text style={styles.buttonText3}>Back Home</Text>
      </Pressable>
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
  button3: {
    backgroundColor: '#808080',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText3: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalToggle: {
    marginBottom: 50,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    padding: 30,
    borderRadius: 10,
    alignSelf: 'auto',
  },
  modalClose: {
    marginTop: 20,
    marginBottom: 0,
    alignSelf: 'flex-end',
  },
  modalContent: {
    flex: 1,
  },
  foodName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  safeArea: {
    flex: 1,
  }
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