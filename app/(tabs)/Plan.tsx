import React, {useEffect, useState } from 'react';
import { StyleSheet, Image, Platform, Text, View, Button, Linking, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db } from "../../firebaseConfig";
import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore"
import Ionicons from '@expo/vector-icons/Ionicons';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useContext } from 'react';
import { ThemeContext } from '@/store/context';


//Ionicons size={310} name="code-slash" style={styles.headerImage}
//headerImage={<Text style={styles.headerText}>UNT</Text>}

//<Image source={require('@/assets/images/unt-banner.png')} style={{ alignSelf: 'center' }} />

/*
headerBackgroundColor={{ light: '#38CB82', dark: '#198450' }}
headerImage={<Image source={require('@/assets/images/unt-banner.png')} style={styles.headerImage}>
*/

type FoodItem = {
  id: string;
  name: string;
  calories: number;
}

const PlanScreen: React.FC = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<FoodItem[]>([]);
  const [servings, setServings] = useState<{ [id: string]: number }>({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const{mainTheme}=useContext(ThemeContext);
  const styles=useStyles();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const colRef = collection(db, 'breakfast'); // Change to 'lunch' or 'dinner' as needed
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

  const calculateTotalCalories = (newServings: { [id: string]: number }) => {
    let total = 0;
    data.forEach(item => {
      total += (newServings[item.id] || 0) * (item.calories || 0);
    });
    setTotalCalories(total);
  };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.mainContent}>
        <ThemedText>Plan functionality</ThemedText>
      </ThemedView>
      
      <Pressable style={styles.button3} onPress={homeButtonPress}>
        <Text style={styles.buttonText3}>Back Home</Text>
      </Pressable>

      <ScrollView style={styles.scrollBox}>
        {error ? (
          <Text style={styles.errorText}>Error: {error}</Text>
        ) : (
          data.map(item => (
            <View key={item.id} style={styles.itemContainer}>
              <Text style={styles.itemText}>{item.name}</Text>
              <View style={styles.buttonContainer}>
                <Pressable onPress={() => handleDecrement(item.id, item.calories)} style={styles.decrementButton}>
                  <Text style={styles.buttonText}>-</Text>
                </Pressable>
                <Text style={styles.servingText}>{servings[item.id] || 0}</Text>
                <Pressable onPress={() => handleIncrement(item.id, item.calories)} style={styles.incrementButton}>
                  <Text style={styles.buttonText}>+</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total Calories: {totalCalories}</Text>
      </View>

      <Pressable style={styles.button3} onPress={homeButtonPress}>
        <Text style={styles.buttonText3}>Back Home</Text>
      </Pressable>
    </View>
  );
};

export default PlanScreen;

function useStyles(){
  const{mainTheme}=useContext(ThemeContext);
  return StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: mainTheme.colors.background,
  },
  mainContent: {
    padding: 20,
    backgroundColor: 'lightgreen',
    marginBottom: 20,
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
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: '#808080',
    padding: 10,
    marginHorizontal: 5,
  },
  decrementButton: {
    backgroundColor: '#808080',
    padding: 10,
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
  servingText: {
    fontSize: 18,
    paddingHorizontal: 10,
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
});}

