import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StyleSheet, Image, Text, View, TouchableOpacity, ScrollView, Pressable, Modal, Switch, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DataContext } from '../../DataContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

type FoodItem = {
  id: string
  name: string
  mealType: string,
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
  is_low_calorie: boolean
  is_high_protein: boolean
  is_high_fat: boolean
  is_high_carbs: boolean
  is_halal: boolean
  is_gluten_free: boolean
  is_allergen_free: boolean
  is_vegan: boolean
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

// Define the types for the modal content
type ModalPage = 'initial' | 'mealSelection' | 'nutrientGoals';
type MealType = 'loseWeight' | 'buildMuscle' | 'carbLoad' | 'advanced';

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const { allData, isLoading, error } = useContext(DataContext);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<ModalPage>('initial');
  const [selectedGoal, setSelectedGoal] = useState<MealType | null>(null);
  const [pageHistory, setPageHistory] = useState<ModalPage[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isVegan, setIsVegan] = useState(false);
  const [isHalal, setIsHalal] = useState(false);
  const [isGluten, setIsGluten] = useState(false);
  const [isAllergens, setIsAllergens] = useState(false);
  const [caloriesMin, setCaloriesMin] = useState('');
  const [caloriesMax, setCaloriesMax] = useState('');
  const [proteinMin, setProteinMin] = useState('');
  const [fatMin, setFatMin] = useState('');
  const [carbohydratesMin, setCarbohydratesMin] = useState('');
  const [mealType, setMealType] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<FoodItem[]>([]);

  const toggleVeganSwitch = () => setIsVegan(prev => !prev);
  const toggleHalalSwitch = () => setIsHalal(prev => !prev);
  const toggleGlutenSwitch = () => setIsGluten(prev => !prev);
  const toggleAllergensSwitch = () => setIsAllergens(prev => !prev);

  const homeButtonPress = () => {
    navigation.navigate('index');
  };

  const openModal = (page: ModalPage) => {
    setPageHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
    setModalOpen(true);
  };

  const goBack = () => {
    const newHistory = [...pageHistory];
    const previousPage = newHistory.pop() || 'initial';
    setPageHistory(newHistory);
    setCurrentPage(previousPage);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedGoal(null);
    setPageHistory([]);
  };

  const closeModalWithoutRemovingGoal = () => {
    setModalOpen(false);
    setPageHistory([]);
  };

  const handleGoalSelection = (goal: MealType) => {
    setSelectedGoal(goal);
    if (goal === 'advanced') {
      openModal('nutrientGoals');
    }
    console.log(goal)
  };

  const handleNutrientSubmit = () => {
    console.log(`Selected Goal: ${selectedGoal}`);
    console.log(`Calories: ${caloriesMin} - ${caloriesMax}`);
    console.log(`Protein Min: ${proteinMin}`);
    console.log(`Fat Min: ${fatMin}`);
    console.log(`Carbs Min: ${carbohydratesMin}`);
    closeModal();
  };

  useFocusEffect(
    useCallback(() => {
      if (isFirstVisit) {
        openModal('initial');
        setIsFirstVisit(false);
      }
    }, [isFirstVisit])
  );

  const filterData = (type: string) => {
    let filteredItems = allData[type] || [];
    console.log('Initial items:', filteredItems.length);

    if (isVegan) {
      filteredItems = filteredItems.filter(item => item.is_vegan);
      console.log('After vegan filter:', filteredItems.length);
    }

    if (isHalal) {
      filteredItems = filteredItems.filter(item => item.is_halal);
      console.log('After halal filter:', filteredItems.length);
    }

    if (isGluten) {
      filteredItems = filteredItems.filter(item => item.is_gluten_free);
      console.log('After gluten-free filter:', filteredItems.length);
    }

    if (isAllergens) {
      filteredItems = filteredItems.filter(item => item.is_allergen_free);
      console.log('After allergen-free filter:', filteredItems.length);
    }

    if (selectedGoal === 'loseWeight') {
      filteredItems = filteredItems.filter(item => item.is_low_calorie);
      console.log('After loseWeight filter:', filteredItems.length);
    } else if (selectedGoal === 'buildMuscle') {
      filteredItems = filteredItems.filter(item => item.is_high_protein);
      console.log('After buildMuscle filter:', filteredItems.length);
    } else if (selectedGoal === 'carbLoad') {
      filteredItems = filteredItems.filter(item => item.is_high_carbs);
      console.log('After carbLoad filter:', filteredItems.length);
    }

    setFilteredData(filteredItems);
  };

  const handleMealTypeSelection = (type: string) => {
    setMealType(type);
    filterData(type);
  };

  useEffect(() => {
    if (mealType) {
        filterData(mealType);
    }
}, [allData, isVegan, isHalal, isGluten, isAllergens, selectedGoal, mealType]);

  const goBackToMealSelection = () => {
    setMealType(null);
    setFilteredData([]);
  };

  useFocusEffect(
    useCallback(() => {
      if (isFirstVisit) {
        openModal('initial');
        setIsFirstVisit(false);
      }
    }, [isFirstVisit])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={homeButtonPress}>
          <Image
            source={require('@/assets/images/back-button.png')}
            style={styles.backButtonIcon}
          />
        </Pressable>

        <Text style={styles.title}>Plan</Text>

        <Modal visible={modalOpen} animationType='fade' transparent={true}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContainer}>
                  {currentPage !== 'initial' && (
                    <Pressable onPress={goBack} style={styles.modalBackButton}>
                      <MaterialIcons name='arrow-back' size={30} />
                    </Pressable>
                  )}
                  <Pressable onPress={closeModal} style={styles.modalCloseButton}>
                    <MaterialIcons name='close' size={30} />
                  </Pressable>

                  {currentPage === 'initial' ? (
                    <>
                      <Text style={styles.modalTitle}>Plan</Text>
                      <Text style={styles.modalText}>Select your dietary restrictions.</Text>
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Vegan</Text>
                        <Switch
                          trackColor={{ false: '#767577', true: '#37cc55' }}
                          thumbColor={isVegan ? '#f4f3f4' : '#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={toggleVeganSwitch}
                          value={isVegan}
                        />
                      </View>
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Halal</Text>
                        <Switch
                          trackColor={{ false: '#767577', true: '#37cc55' }}
                          thumbColor={isHalal ? '#f4f3f4' : '#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={toggleHalalSwitch}
                          value={isHalal}
                        />
                      </View>
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Gluten-Free</Text>
                        <Switch
                          trackColor={{ false: '#767577', true: '#37cc55' }}
                          thumbColor={isGluten ? '#f4f3f4' : '#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={toggleGlutenSwitch}
                          value={isGluten}
                        />
                      </View>
                      <View style={styles.switchContainer}>
                        <Text style={styles.switchText}>Allergen-Free</Text>
                        <Switch
                          trackColor={{ false: '#767577', true: '#37cc55' }}
                          thumbColor={isAllergens ? '#f4f3f4' : '#f4f3f4'}
                          ios_backgroundColor="#3e3e3e"
                          onValueChange={toggleAllergensSwitch}
                          value={isAllergens}
                        />
                      </View>
                      <TouchableOpacity style={styles.modalButtonNext} onPress={() => openModal('mealSelection')}>
                        <Text style={styles.modalButtonText}>NEXT</Text>
                      </TouchableOpacity>
                    </>
                  ) : currentPage === 'mealSelection' ? (
                    <>
                      <Text style={styles.modalTitle}>Select Your Goal</Text>
                      <Text style={styles.modalText}>Choose a goal that fits you best:</Text>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          selectedGoal === 'loseWeight' && styles.selectedButton,
                        ]}
                        onPress={() => handleGoalSelection('loseWeight')}
                      >
                        <Text style={styles.modalButtonText}>Lose Weight</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          selectedGoal === 'buildMuscle' && styles.selectedButton,
                        ]}
                        onPress={() => handleGoalSelection('buildMuscle')}
                      >
                        <Text style={styles.modalButtonText}>Build Muscle</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          selectedGoal === 'carbLoad' && styles.selectedButton,
                        ]}
                        onPress={() => handleGoalSelection('carbLoad')}
                      >
                        <Text style={styles.modalButtonText}>Carb Load</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalButton,
                          selectedGoal === 'advanced' && styles.selectedButton,
                        ]}
                        onPress={() => handleGoalSelection('advanced')}
                      >
                        <Text style={styles.modalButtonText}>Advanced</Text>
                      </TouchableOpacity>
                      {selectedGoal && selectedGoal !== 'advanced' && (
                        <View style={styles.dropdownContainer}>
                          <Text style={styles.dropdownText}>
                            {selectedGoal === 'loseWeight' && 'You will receive menu options with a lower calorie count.'}
                            {selectedGoal === 'buildMuscle' && 'You will receive menu options with a higher protein.'}
                            {selectedGoal === 'carbLoad' && 'You will receive menu options with a higher carb count.'}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity style={styles.modalButtonNext} onPress={closeModalWithoutRemovingGoal}>
                        <Text style={styles.modalButtonText}>CLOSE</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <Text style={styles.modalTitle}>Set Nutrient Goals for {selectedGoal}</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Min Calories"
                        keyboardType="numeric"
                        value={caloriesMin}
                        onChangeText={setCaloriesMin}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Max Calories"
                        keyboardType="numeric"
                        value={caloriesMax}
                        onChangeText={setCaloriesMax}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Min Protein (g)"
                        keyboardType="numeric"
                        value={proteinMin}
                        onChangeText={setProteinMin}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Min Fat (g)"
                        keyboardType="numeric"
                        value={fatMin}
                        onChangeText={setFatMin}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Min Carbohydrates (g)"
                        keyboardType="numeric"
                        value={carbohydratesMin}
                        onChangeText={setCarbohydratesMin}
                      />
                      <TouchableOpacity style={styles.modalButtonNext} onPress={handleNutrientSubmit}>
                        <Text style={styles.modalButtonText}>SUBMIT</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {mealType ? (
          <>
            <Pressable style={styles.backButton} onPress={goBackToMealSelection}>
              <MaterialIcons name='arrow-back' size={30} />
            </Pressable>
            <ScrollView style={styles.scrollBox}>
              {filteredData.map(item => (
                <View key={`${mealType}-${item.id}`} style={styles.itemContainer}>
                  <Text style={styles.itemText}>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        ) : (
          <>
            <Pressable style={styles.resetButton} onPress={() => handleMealTypeSelection('breakfast')}>
              <Text style={styles.resetText}>Breakfast</Text>
            </Pressable>

            <Pressable style={styles.resetButton} onPress={() => handleMealTypeSelection('lunch')}>
              <Text style={styles.resetText}>Lunch</Text>
            </Pressable>

            <Pressable style={styles.resetButton} onPress={() => handleMealTypeSelection('dinner')}>
              <Text style={styles.resetText}>Dinner</Text>
            </Pressable>
            <TouchableOpacity style={styles.openModalButton} onPress={() => openModal('initial')}>
              <Text style={styles.openModalButtonText}>Edit Preferences</Text>
            </TouchableOpacity>
          </>
        )}
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dfe9e4',
  },
  title: {
    fontSize: 55,
    fontWeight: 'bold',
    color: '#689882',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -30,
    top: '-8%',
    left: '38%',
  },
  openModalButton: {
    backgroundColor: '#4b7863',
    padding: 10,
    borderRadius: 30,
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 60,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  openModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 350,
    height: 670,
    padding: 20,
    backgroundColor: '#c9dcd4',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
  },
  modalBackButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  modalTitle: {
    fontSize: 35,
    marginBottom: 20,
    marginTop: 0,
    color: '#447961',
    fontWeight: 'bold',
  },
  modalText: {
    fontSize: 20,
    marginBottom: 30,
    color: '#000000',
  },
  switchText: {
    fontSize: 25,
    color: 'black',
    marginRight: 10,
    textAlign: 'right',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: '#447961',
    padding: 15,
    borderRadius: 40,
    marginTop: 10,
    width: '90%',
    alignItems: 'center',
  },
  modalButtonNext: {
    backgroundColor: '#447961',
    padding: 15,
    borderRadius: 40,
    marginTop: 80,
    width: '90%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#86b9a3',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  dropdownText: {
    fontSize: 18,
    color: '#000',
  },
  input: {
    height: 40,
    borderColor: '#9F9F9F',
    borderWidth: 1,
    borderRadius: 50,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  backButton: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    height: 50,
    width: 50,
  },
  backButtonIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  resetText: {
    fontSize: 30,
    color: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#689882',
    height: '15%',
    width: '75%',
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 25,
    borderRadius: 50,
  },
  scrollBox: {
    flex: 1,
  },
  itemContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: 'black',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PlanScreen;