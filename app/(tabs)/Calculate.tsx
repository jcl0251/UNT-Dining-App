import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, Text, View, Button, Linking, TouchableOpacity, ScrollView, Pressable, Modal, useColorScheme } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DataContext} from '../../DataContext';
import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore"
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type FoodItem = {
  id: string
  name: string
  calories: number
  total_fat: number
  cholesterol: number
  sodium: number
  total_carbohydrates: number
  protein: number
  allergens: string
  ingredients: string
  serving_size: number
  is_each: boolean
  is_high_calorie: boolean
  is_high_protein: boolean
  is_high_fat: boolean
  is_high_carbs: boolean
  is_halal: boolean
  is_gluten_free: boolean
  is_allergen_free: boolean
  total_fat_percent: number
  sodium_percent: number
  total_carbohydrates_percent: number
  saturated_fat: number
  trans_fat: number
  saturated_fat_percent: number
  dietary_fiber: number
  dietary_fiber_percent: number
  added_sugars_percent: number
  added_sugars: number
  sugars: number
}

const CalculateScreen: React.FC = () => {
  const navigation = useNavigation();
  const { allData, isLoading, error } = useContext(DataContext);
  const [data, setData] = useState<FoodItem[]>([]);
  const [servings, setServings] = useState<{ [id: string]: number }>({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [activeTab, setActiveTab] = useState<string>('breakfast'); // Default to 'breakfast'

  //declaration of dark mode variables
  const colorScheme = useColorScheme();  //calls the usecolorscheme library
  const isDarkMode = colorScheme === 'dark';  //bool like variable to check if the phone is in dark mode or not

  useEffect(() => {
    if (allData[activeTab]) {
      //console.log('Data for active tab:', allData[activeTab]);
      setData(allData[activeTab]);
    }
  }, [activeTab, allData, isLoading]);

  const homeButtonPress = () => {
    //navigation.navigate('Calculate'); // Navigating to the 'Calculate' tab
    navigation.navigate('index');
  };

  const tabButtonStyle = (tabName: string) => ({
    ...styles.tabButton,
    backgroundColor: activeTab === tabName ? '#86b9a3' : '#4b7863',
  });

  const tabTextStyle = (tabName: string) => ({
    ...styles.tabText,
    color: activeTab === tabName ? 'black' : 'white',
  });

  const handleIncrement = (id: string, calories: number) => {
    setServings(prevServings => {
      const newServings = { ...prevServings, [id]: (prevServings[id] || 0) + 1 };
      calculateTotalCalories(newServings);
      calculateTotalProtein(newServings); //2
      calculateTotalCarbs(newServings); //3
      calculateTotalFat(newServings); //4
      return newServings;
    });
  };
  
  const handleDecrement = (id: string, calories: number) => {
    setServings(prevServings => {
      const newServings = { ...prevServings, [id]: Math.max((prevServings[id] || 0) - 1, 0) };
      calculateTotalCalories(newServings);
      calculateTotalProtein(newServings); //2
      calculateTotalCarbs(newServings); //3
      calculateTotalFat(newServings); //4
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

  const calculateTotalProtein = (newServings: { [id: string]: number }) => { // Key-value pair of food ID and its number of servings
    let total = 0;
    data.forEach(item => {
      total += (newServings[item.id] || 0) * (item.protein || 0);
    });
    setTotalProtein(Math.round(total));
  };

  const calculateTotalCarbs = (newServings: { [id: string]: number }) => { // Key-value pair of food ID and its number of servings
    let total = 0;
    data.forEach(item => {
      total += (newServings[item.id] || 0) * (item.total_carbohydrates || 0);
    });
    setTotalCarbs(Math.round(total));
  };

  const calculateTotalFat = (newServings: { [id: string]: number }) => { // Key-value pair of food ID and its number of servings
    let total = 0;
    data.forEach(item => {
      total += (newServings[item.id] || 0) * (item.total_fat || 0);
    });
    setTotalFat(Math.round(total));
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
    setTotalProtein(0); //set the total protein to 0
    setTotalCarbs(0); //set the total carbs to 0
    setTotalFat(0); //set the total fat to 0
  };



  //MAIN

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>

        <Pressable style={styles.backButton} onPress={homeButtonPress}>
          <Image
            source={require('@/assets/images/back-button.png')}
            style={styles.backButtonIcon}
          />
        </Pressable>

        {/*TOP HEADING*/}
        <Text style={styles.title}>Calculate</Text>

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
          ) : isLoading ? (
            <Text style={styles.loadingText}>Loading...</Text>
          ) : (
            data.map(item => ( // KEEP THIS VVVV HANDLEFOODPRESS AS TEXT AND NOT PRESSABLE BC FLEX AND WRAP GETS MESSED UP
              <View key={item.id} style={styles.itemContainer}> 
                
                <TouchableOpacity onPress={() => handleFoodPress(item)} style={styles.itemText}>
                    <Text style={styles.wordText}>{item.name}</Text>
                  </TouchableOpacity>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={() => handleDecrement(item.id, item.calories)} style={styles.decrementButton}>
                    <Text style={styles.buttonText}>-</Text>
                  </TouchableOpacity>

                  <Text style={[styles.servingText, dynamicStyles.text]}>{servings[item.id] || 0}</Text>
                  <TouchableOpacity onPress={() => handleIncrement(item.id, item.calories)} style={styles.incrementButton}>
                    <Text style={styles.buttonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        


        <Modal visible={modalOpen} animationType='slide'>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Pressable onPress={() => setModalOpen(false)} style={styles.modalToggle}>
                  <MaterialIcons
                  name='close'
                  size={30}
                  />
                </Pressable>
                {selectedFood && (
                  <View style={styles.nutritionLabelContainer}>
                    <Text style={styles.itemName}>{selectedFood.name}</Text>
                    <View style={styles.horizontalLine3} />
                    <Text style={styles.labelText1}>Nutrition Facts</Text>
                    <View style={styles.horizontalLine4} />
                    <View style={styles.row}>
                      <Text style={styles.labelText2}>Serving Size</Text>
                      <Text style={styles.valueText2}>{selectedFood.serving_size}</Text>
                    </View>
                    <View style={styles.horizontalLine1} />
                    <View style={styles.row2}>
                      <Text style={styles.labelText5}>Amount per serving</Text>
                    </View>
                    <View style={styles.horizontalLine4} />
                    <View style={styles.row}>
                      <Text style={styles.labelText1}>Calories</Text>
                      <Text style={styles.valueText1}>{selectedFood.calories}</Text>
                    </View>
                    <View style={styles.horizontalLine2} />
                    <View style={styles.row}>
                      <Text style={styles.labelText3}>Total Fat</Text>
                      <Text style={styles.valueText3}>{selectedFood.total_fat}g</Text>
                      <Text style={styles.percentText}>{selectedFood.total_fat_percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText4}>  Saturated Fat</Text>
                      <Text style={styles.valueText3}>{selectedFood.saturated_fat}g</Text>
                      <Text style={styles.percentText}>{selectedFood.saturated_fat_percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText4}>  Trans Fat</Text>
                      <Text style={styles.valueText3}>{selectedFood.trans_fat}g</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText3}>Cholesterol</Text>
                      <Text style={styles.valueText3}>{selectedFood.cholesterol}mg</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText3}>Sodium</Text>
                      <Text style={styles.valueText3}>{selectedFood.sodium}mg</Text>
                      <Text style={styles.percentText}>{selectedFood.sodium_percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText3}>Total Carbohydrates</Text>
                      <Text style={styles.valueText3}>{selectedFood.total_carbohydrates}g</Text>
                      <Text style={styles.percentText}>{selectedFood.total_carbohydrates_percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText4}>  Dietary Fiber</Text>
                      <Text style={styles.valueText3}>{selectedFood.dietary_fiber}g</Text>
                      <Text style={styles.percentText}>{selectedFood.dietary_fiber_percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText4}>  Sugars</Text>
                      <Text style={styles.valueText3}>{selectedFood.sugars}g</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText4}>  </Text>
                      <Text style={styles.valueText4}>Includes {selectedFood.added_sugars}g Added Sugars</Text>
                      <Text style={styles.percentText}>{selectedFood.added_sugars_percent.toFixed(0)}%</Text>
                    </View>
                    <View style={styles.horizontalLine5} />
                    <View style={styles.row}>
                      <Text style={styles.labelText3}>Protein</Text>
                      <Text style={styles.valueText3}>{selectedFood.protein}g</Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        
        

        <View style={styles.totalContainer}>
          <View style={styles.totalTextLeft}>
            <Text style={styles.totalTextLeft}>CALORIES: {totalCalories}</Text>
          </View>
          <View style={styles.totalTextRight}>
            <Text style={styles.totalText}>Protein : {totalProtein}g</Text>
            <Text style={styles.totalText}>Carbs : {totalCarbs}g</Text>
            <Text style={styles.totalText}>Fat : {totalFat}g</Text>
          </View>
          
        </View>

        <Pressable 
          style={styles.resetButton} //changes the style of the button to the button style at the bottom
          onPress={resetButtonPress} //takes you to calculate tab when pressed
        > 
            <Text style={styles.resetText}>Reset</Text>
        </Pressable>
        
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: '#cbdbd4', // BACKGROUND FOR CALCULATE PAGE. COLOR
  },
  mainContent: {
    padding: 50,
    //backgroundColor: 'lightgreen',
    //marginBottom: 20,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#689882',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -30,
    top: '-8%',
    left: '25%',
  },
  scrollBox: {
    flex: 1,
    backgroundColor: '#86b9a3',
  },
  itemContainer: {
    padding: 1,
    marginBottom: 10,
    //backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
        //borderRadius: 20,
  },
  itemText: {
    fontSize: 39,
    color: 'white',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10,
    borderRadius: 7,
    backgroundColor: '#609080',
    
    //height: '5%',
    //width: '25%',
    padding: 5,
    //justifyContent: 'center',
    //alignItems: 'center',
    //marginTop: 5,

  },
  wordText: {
    fontSize: 15,
    color: 'white',
    //backgroundColor: '#4b7863',
    //paddingHorizontal: 7, // Adjust the horizontal padding as needed
    //paddingVertical: 2, // Adjust the vertical padding as needed
    //borderRadius: 50,
  },
  resetText: {
    fontSize: 16,
    color: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
  resetButton: {
    backgroundColor: '#4b7863',
    height: '5%',
    width: '25%',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 5,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: 'transparent', // Transparent background
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 35,
    borderRadius: 17.5, // Half of the width and height to make it a circle
    borderWidth: 2, // Border width to create the hollow effect
    borderColor: 'white', // White border color
    marginHorizontal: 5,
  },
  decrementButton: {
    backgroundColor: 'transparent', // Transparent background
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 35,
    borderRadius: 17.5, // Half of the width and height to make it a circle
    borderWidth: 2, // Border width to create the hollow effect
    borderColor: 'white', // White border color
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 25,
    color: 'white',
  },
  servingText: { //Incrementer value between - and + containers
    fontSize: 18,
    paddingHorizontal: 10,
    minWidth: 40, //32 Ensure a minimum width for single digits
    maxWidth: 45,
    textAlign: 'center',
    color: 'white',
  },
  totalContainer: { //total calories display
    backgroundColor: '#689882',
    marginVertical: 10,
    borderRadius: 20,
    width: 350,
    margin: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  totalTextLeft: {
    flex: 1,
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    alignContent: 'flex-start',
    justifyContent: 'center',
    letterSpacing: -2,
  },
  totalTextRight: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    alignContent: 'flex-end',
    alignItems: 'flex-end',
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
    marginBottom: -4,
    //color: '#4b7863',
    
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
  modalContainer: { // Modal's container/background 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalToggle: { // Modal's exit button
    backgroundColor: 'transparent',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'auto',
    marginTop: 30
  },
  modalContent: { // Modal's main info
    flex: 1,
    width: '90%',
  },
  safeArea: {
    flex: 1,
  },
  nutritionLabelContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  labelText1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  labelText2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  labelText3: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelText4: {
    fontSize: 16,
  },
  labelText5: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
  },
  row2: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch',
  },
  valueText1: {
    fontSize: 40,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  valueText2: {
    fontSize: 20,
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  valueText3: {
    fontSize: 15,
    flex: 1,
    textAlign: 'left',
    fontFamily: 'Arial',
    marginLeft: 2,
  },
  valueText4: {
    fontSize: 15,
    textAlign: 'left',
    fontFamily: 'Arial',
    marginLeft: 2,
  },
  percentText: {
    fontSize: 17,
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  horizontalLine1: {
    borderBottomColor: 'black',
    borderBottomWidth: 10,
    alignSelf: 'stretch',
    marginVertical: 5,
    width: '100%',
  },
  horizontalLine2: {
    borderBottomColor: 'black',
    borderBottomWidth: 5,
    alignSelf: 'stretch',
    marginVertical: 5,
    width: '100%',
  },
  horizontalLine3: {
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    alignSelf: 'stretch',
    marginVertical: 5,
    width: '100%',
  },
  horizontalLine4: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    alignSelf: 'stretch',
    marginVertical: 5,
    width: '100%',
  },
  horizontalLine5: {
    borderBottomColor: 'black',
    borderBottomWidth: .4,
    alignSelf: 'stretch',
    marginVertical: 5,
    width: '100%',
  },
  testText: {
    fontSize: 18,
    color: 'white',
    flex: 1,
    flexWrap: 'wrap',
    marginRight: 10,
    flexGrow: 1,
    flexShrink: 1,
  },
  loadingText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
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