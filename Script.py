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
    labels = table.find_all('div', class_='label') + table.find_all('div', class_='labellight')
    percentages = table.find_all('div', class_='dv')
    
    nutrients = {
        'Calories': 0,
        'Total Fat': 0,
        'Saturated Fat': 0,
        'Trans Fat': 0,
        'Cholesterol': 0,
        'Sodium': 0,
        'Total Carbohydrates': 0,
        'Dietary Fiber': 0,
        'Sugars': 0,
        'Added Sugars': 0,
        'Protein': 0
    }
    
    nutrient_percentages = {
        'Total Fat Percent': 0,
        'Saturated Fat Percent': 0,
        'Sodium Percent': 0,
        'Total Carbohydrates Percent': 0,
        'Dietary Fiber Percent': 0,
        'Added Sugars Percent': 0
    }

    # List to match labels to their percentage values
    label_order = [
        'Total Fat', 'Saturated Fat', 'Sodium', 'Total Carbohydrates', 
        'Dietary Fiber', 'Added Sugars'
    ]
    
    percentage_values = []
    for percent in percentages:
        percent_text = percent.get_text(strip=True).replace('%', '')
        if percent_text.isdigit():
            percentage_values.append(float(percent_text))
    
    print("Debug: All percentage divs")
    for percent in percentage_values:
        print(percent)
    
    # Adjust the index to correctly align percentages
    for i, nutrient_name in enumerate(label_order):
        if i < len(percentage_values):
            nutrient_percentages[f'{nutrient_name} Percent'] = percentage_values[i]
            print(f"Debug: {nutrient_name} assigned {percentage_values[i]}%")
    
    for label in labels:
        label_text = label.get_text(strip=True)
        match_label = re.match(r'([a-zA-Z\s]+)([\d\.]+)(g|mg)?', label_text)
        if match_label:
            nutrient_name = match_label.group(1).strip()
            nutrient_value = float(match_label.group(2))
            if nutrient_name in nutrients:
                nutrients[nutrient_name] = nutrient_value
        
        # Handle 'Includes Xg Added Sugars'
        if 'Includes' in label_text:
            match_added_sugars = re.search(r'Includes\s([\d\.]+)g\sAdded\sSugars', label_text)
            if match_added_sugars:
                added_sugars_value = float(match_added_sugars.group(1))
                nutrients['Added Sugars'] = added_sugars_value

    nutrients.update(nutrient_percentages)
    
    print("Debug: Nutrients with percentages")
    for nutrient, value in nutrients.items():
        print(f"{nutrient}: {value}")
    
    return nutrients

def find_ingredients(url):
    
    soup = scrape(url)
    
    ingredient_info = soup.find_all('p', class_='modal-description-text')
    results = [p.get_text(strip=True) for p in ingredient_info]
    return results

def find_serving_size(url):
    soup = scrape(url)
    
    serving_size_tag = soup.find('span', class_='highlighted')
    if serving_size_tag:
        serving_size = serving_size_tag.get_text(strip=True)
        is_each = 'each' in serving_size.lower() # This assigns true or false to variable IF 'each' is detected in the serving_size
        return serving_size, is_each
    return None, False #If there is no serving size tag or each!? Shouldn't hit but its a failsafe

def serving_based_nutrition(calories, protein, total_fat, total_carbohydrates, serving_size, is_each): # Takes all of these and calculates if high/low etc
    is_high_calorie = calories >= 400 # High calorie is 400+ calories in one serving
    is_high_protein = protein >= (calories/10) # High protein is 1+ gram protein per 10 calories
    is_high_fat = total_fat > 17.5 / 3.5 # per oz. Its 100g or 3.5 oz
    is_high_carbs = total_carbohydrates >= 15 # If >= 15 g, its high carbs.
    return is_high_calorie, is_high_protein, is_high_fat, is_high_carbs
    

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
    library_collection_reference = database.collection('library')
    
    for dish in data:
        dish_id = dish[0]
        dish_nutrition_url = f"https://diningmenus.unt.edu/label.aspx?recipeNum={dish_id}"
        nutrition = find_nutrition(dish_nutrition_url)
        ingredients = find_ingredients(dish_nutrition_url)
        serving_size, is_each = find_serving_size(dish_nutrition_url)
        allergens = ingredients[0].lower().split(',') if ingredients else []
        
        calories = nutrition['Calories']
        total_fat = nutrition['Total Fat']
        protein = nutrition['Protein']
        total_carbohydrates = nutrition['Total Carbohydrates']
        
        is_high_calorie, is_high_protein, is_high_fat, is_high_carbs = serving_based_nutrition(calories, protein, total_fat, total_carbohydrates, serving_size, is_each)
        is_halal = "pork" not in allergens
        is_gluten_free = "wheat" not in allergens
        is_allergen_free = len(allergens) == 0
        
        
        document_reference = collection_reference.document(dish_id) #Creates documents (entries) in the collection (mealtype). AKA puts meals in meals of day
        document_reference.set({
            'name': dish[1],
            'header': dish[2],
            'calories': calories,
            'total_fat': total_fat,
            'saturated_fat': nutrition['Saturated Fat'],
            'trans_fat': nutrition['Trans Fat'],
            'cholesterol': nutrition['Cholesterol'],
            'sodium': nutrition['Sodium'],
            'total_carbohydrates': total_carbohydrates,
            'dietary_fiber': nutrition['Dietary Fiber'],
            'sugars': nutrition['Sugars'],
            'added_sugars': nutrition['Added Sugars'],
            'protein': protein,
            'total_fat_percent': nutrition.get('Total Fat Percent', 0),
            'saturated_fat_percent': nutrition.get('Saturated Fat Percent', 0),
            'sodium_percent': nutrition.get('Sodium Percent', 0),
            'total_carbohydrates_percent': nutrition.get('Total Carbohydrates Percent', 0),
            'dietary_fiber_percent': nutrition.get('Dietary Fiber Percent', 0),
            'added_sugars_percent': nutrition.get('Added Sugars Percent', 0),
            'allergens': ingredients[0] if len(ingredients) > 0 else '', # Chance that there aren't any allergens so this is just in case
            'ingredients': ingredients[1] if len(ingredients) > 1 else '',
            'serving_size': serving_size,
            'is_each': is_each,
            'is_high_calorie': is_high_calorie,
            'is_high_protein': is_high_protein,
            'is_high_fat': is_high_fat,
            'is_high_carbs': is_high_carbs,
            'is_halal': is_halal,
            'is_gluten_free': is_gluten_free,
            'is_allergen_free': is_allergen_free,
        })
        
        library_document_reference = library_collection_reference.document(dish_id) #Here we are just storying every ID into a library that wont be overwritten so we can essentially use a search bar
        library_document_reference.set({
            'name': dish[1],
            'header': dish[2],
            'calories': calories,
            'total_fat': total_fat,
            'saturated_fat': nutrition['Saturated Fat'],
            'trans_fat': nutrition['Trans Fat'],
            'cholesterol': nutrition['Cholesterol'],
            'sodium': nutrition['Sodium'],
            'total_carbohydrates': total_carbohydrates,
            'dietary_fiber': nutrition['Dietary Fiber'],
            'sugars': nutrition['Sugars'],
            'added_sugars': nutrition['Added Sugars'],
            'protein': protein,
            'total_fat_percent': nutrition.get('Total Fat Percent', 0),
            'saturated_fat_percent': nutrition.get('Saturated Fat Percent', 0),
            'sodium_percent': nutrition.get('Sodium Percent', 0),
            'total_carbohydrates_percent': nutrition.get('Total Carbohydrates Percent', 0),
            'dietary_fiber_percent': nutrition.get('Dietary Fiber Percent', 0),
            'added_sugars_percent': nutrition.get('Added Sugars Percent', 0),
            'allergens': ingredients[0] if len(ingredients) > 0 else '', # Chance that there aren't any allergens so this is just in case
            'ingredients': ingredients[1] if len(ingredients) > 1 else '',
            'serving_size': serving_size,
            'is_each': is_each,
            'is_high_calorie': is_high_calorie,
            'is_high_protein': is_high_protein,
            'is_high_fat': is_high_fat,
            'is_high_carbs': is_high_carbs,
            'is_halal': is_halal,
            'is_gluten_free': is_gluten_free,
            'is_allergen_free': is_allergen_free,
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