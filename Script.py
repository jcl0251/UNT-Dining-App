import re
from bs4 import BeautifulSoup
import requests
import csv
import html
import sqlite3
import os
import firebase_admin
from firebase_admin import credentials, firestore


# Function that utilizes BeautifulSoup and Requests to fetch and parse a site
def scrape(url):
    #print(f"Fetching URL: {url}")
    response = requests.get(url) # Gets page from url
    content = response.text # Turn into text
    soup = BeautifulSoup(content, 'html.parser') # Parse as html
    return soup

# Function that determines which meal of the day the meals belong to based on the section's html ID 
# It then puts them into a dictionary to map MEALOFDAY : MEAL
def find_meal_of_day(url):
    soup = scrape(url)
    
    meals_of_day = { # DICTIONARY. Key-value pair is MEALOFDAY : ID
        'Breakfast': soup.find(id='breakfast'), 
        'Lunch': soup.find(id='lunch'),
        'Dinner': soup.find(id='dinner')
    }
    
    list_groups = {} # Will later map meal type to the meal itself
    
    for meal_type, meal_of_day in meals_of_day.items():
        if meal_of_day:
            headers_and_groups = []
            headers = meal_of_day.find_all('p', class_='h5 text-light text-center mb-0')
            for header in headers:
                header_text = header.get_text(strip=True)
                list_group = header.find_next('ul', class_='list-group')
                if list_group:
                    headers_and_groups.append((header_text, list_group))
            list_groups[meal_type] = headers_and_groups
        else:
            list_groups[meal_type] = []
    
    return list_groups

def find_nutrition(url):
    soup = scrape(url)
    
    
    table = soup.find('tbody') # Table containing all of the nutritional info
    labels = table.find_all('div', class_='label')
    nutrients = [0, 0, 0, 0, 0, 0]
    
    for label in labels:
        label_text = label.get_text(strip=True)
        # Split the label_text into name and value
        match_label = re.match(r'([a-zA-Z\s]+)([\d\.]+)(g|mg)?', label_text)
        if match_label:
            nutrient_name = match_label.group(1).strip()
            nutrient_value = float(match_label.group(2))
            #print(f"Found {nutrient_name}: {nutrient_value}")
            if nutrient_name == "Calories":
                nutrients[0] = nutrient_value
            elif nutrient_name == "Total Fat":
                nutrients[1] = nutrient_value
            elif nutrient_name == "Cholesterol":
                nutrients[2] = nutrient_value
            elif nutrient_name == "Sodium":
                nutrients[3] = nutrient_value
            elif nutrient_name == "Total Carbohydrates":
                nutrients[4] = nutrient_value
            elif nutrient_name == "Protein":
                nutrients[5] = nutrient_value
        #print(nutrients)
    return nutrients

def find_ingredients(url):
    soup = scrape(url)
    
    ingredient_info = soup.find_all('p', class_='modal-description-text')
    pattern = r'<p[^>]*id="(\d+)"[^>]*>(.*?)<\/p>'
    results = [p.get_text(strip=True) for p in ingredient_info]
    return results
    

# Function that removes all html tags and text through RegEx
def cleanup_list_group(list_group):
    header, ul = list_group
    data_string = str(ul)
    
    # Define your pattern to match <li> tags
    pattern = r'<li[^>]*id="(\d+)"[^>]*>(.*?)<\/li>'
    
    # Find all matches using regular expressions
    matches = re.findall(pattern, data_string, re.DOTALL)
    
    # Create a list of tuples with ID, name, and header
    data = [(match[0], html.unescape(match[1].strip()), header) for match in matches]
    
    # Print raw data for debugging
    #print(f"Raw data for header '{header}':")
    #for item in data:
        #print(item)
    
    return data
    
def link_firebase():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(current_directory, 'project-c2f87-firebase-adminsdk-v6ze4-5ec08aa368.json')
    cred = credentials.Certificate(path)
    firebase_admin.initialize_app(cred) 
    database = firestore.client()
    return database

def clear_firestore_collection(database, collection): # SO INFO DOESN'T OVERWRITE IN COLLECTIONS OTHER THAN LIBRARY
    collection_reference = database.collection(collection)
    docs = collection_reference.stream() # From fir
    for doc in docs:
        doc.reference.delete()

def input_to_firestore(database, data, meal_type):
    collection_reference = database.collection(meal_type.lower())
    ingredient_collection_reference = database.collection('ingredients')
    library_collection_reference = database.collection('library')
    
    for dish in data:
        dish_id = dish[0]
        dish_nutrition_url = f"https://diningmenus.unt.edu/label.aspx?recipeNum={dish_id}"
        nutrition = find_nutrition(dish_nutrition_url)
        ingredients = find_ingredients(dish_nutrition_url)
        
        document_reference = collection_reference.document(dish_id) #Creates documents (entries) in the collection (mealtype). AKA puts meals in meals of day
        document_reference.set({
            'name': dish[1],
            'header': dish[2],
            'calories': nutrition[0],
            'total_fat': nutrition[1],
            'cholesterol': nutrition[2],
            'sodium': nutrition[3],
            'total_carbohydrates': nutrition[4],
            'protein': nutrition[5],
            'allergens': ingredients[0] if len(ingredients) > 0 else '', # Chance that there aren't any allergens so this is just in case
            'ingredients': ingredients[1] if len(ingredients) > 1 else ''
        })
        
        library_document_reference = library_collection_reference.document(dish_id) #Here we are just storying every ID into a library that wont be overwritten so we can essentially use a search bar
        library_document_reference.set({
            'name': dish[1],
            'header': dish[2],
            'calories': nutrition[0],
            'total_fat': nutrition[1],
            'cholesterol': nutrition[2],
            'sodium': nutrition[3],
            'total_carbohydrates': nutrition[4],
            'protein': nutrition[5],
            'allergens': ingredients[0] if len(ingredients) > 0 else '', # Chance that there aren't any allergens so this is just in case
            'ingredients': ingredients[1] if len(ingredients) > 1 else ''
        })
        
    
if __name__ == "__main__":
    url1 = 'https://diningmenus.unt.edu/?locationID=20'
    
    list_groups = find_meal_of_day(url1)
    

    all_data = {'Breakfast': [], 'Lunch': [], 'Dinner': []}
    
    #create_database()
    
    database = link_firebase()
    
    clear_firestore_collection(database, 'breakfast')
    clear_firestore_collection(database, 'lunch')
    clear_firestore_collection(database, 'dinner')
    
    for meal_type, groups in list_groups.items():
        print(f"Processing {meal_type}")
        for list_group in groups:
            data = cleanup_list_group(list_group)
            all_data[meal_type].extend(data)
            input_to_firestore(database, data, meal_type)
            #input_data(data, meal_type)
            #export_to_CSV(data, meal_type)
    #input("\nPress Enter to close...") #Just for testing with executable