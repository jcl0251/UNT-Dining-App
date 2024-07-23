import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { db } from "./firebaseConfig";
import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore"

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
};

type DataContextType = {
  allData: { [key: string]: FoodItem[] };
  isLoading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextType>({
  allData: {},
  isLoading: true,
  error: null,
});

const DataProvider = ({ children }: { children: ReactNode }) => {
    const [allData, setAllData] = useState<{ [key: string]: FoodItem[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => { // FETCHING THE DATA FROM THE DATABASE
        const fetchData = async () => {
          try {
            const mealTypes = ['breakfast', 'lunch', 'dinner'];
            const allFetchedData: {[key: string]: FoodItem[] } = {};
    
            //const colRef = collection(db, activeTab); // Change to 'lunch' or 'dinner' as needed
    
            for (const mealType of mealTypes) 
            {
              const colRef = collection(db, mealType);
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
                allergens: doc.data().allergens,
                ingredients: doc.data().ingredients,
                serving_size: doc.data().serving_size,
                is_each: doc.data().serving_size,
                is_high_calorie: doc.data().is_high_calorie,
                is_high_protein: doc.data().is_high_protein,
                is_high_fat: doc.data().is_high_fat,
                is_high_carbs: doc.data().is_high_carbs,
                is_halal: doc.data().is_halal,
                is_gluten_free: doc.data().is_gluten_free,
                is_allergen_free: doc.data().is_allergen_free,
                total_fat_percent: doc.data().total_fat_percent,
                sodium_percent: doc.data().sodium_percent,
                total_carbohydrates_percent: doc.data().total_carbohydrates_percent,
                saturated_fat: doc.data().saturated_fat,
                trans_fat: doc.data().trans_fat,
                saturated_fat_percent: doc.data().saturated_fat_percent, 
                dietary_fiber: doc.data().dietary_fiber,
                dietary_fiber_percent: doc.data().dietary_fiber_percent,
                added_sugars_percent: doc.data().added_sugars_percent,
                added_sugars: doc.data().added_sugars,
                sugars: doc.data().sugars
              }));
    
              docs.sort((a,b) => a.name.localeCompare(b.name));
              allFetchedData[mealType] = docs;
            }

            //console.log('Fetched Data:', allFetchedData);
            setAllData(allFetchedData);
            setIsLoading(false);
          } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
          }
        };

        fetchData();
    }, []);

    return (
        <DataContext.Provider value={{ allData, isLoading, error }}>
            {children}
        </DataContext.Provider>
    );
};

export {DataContext, DataProvider };