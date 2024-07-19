import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { db } from "./firebaseConfig";
import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore"

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
                ingredients: doc.data().ingredients
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