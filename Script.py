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
    response = requests.get(url) # Gets page from url
    content = response.text # Turn into text
    soup = BeautifulSoup(content, 'html.parser') # Parse as html
    return soup

def scrape_for_meal_of_day(url):
    soup = scrape(url)
    
    meals_of_day = { # DICTIONARY. Key-value pair is MEALOFDAY : ID
        'Breakfast': soup.find(id='breakfast'), 
        'Lunch': soup.find(id='lunch'),
        'Dinner': soup.find(id='dinner')
    }
    return meals_of_day

def find_meal_of_day(url):
    meals_of_day = scrape_for_meal_of_day(url)
    
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

    label_order = [
        'Total Fat', 'Saturated Fat', 'Sodium', 'Total Carbohydrates', 
        'Dietary Fiber', 'Added Sugars'
    ]
    
    percentage_values = []
    for percent in percentages:
        percent_text = percent.get_text(strip=True).replace('%', '')
        if percent_text.isdigit():
            percentage_values.append(float(percent_text))
    
    for i, nutrient_name in enumerate(label_order):
        if i < len(percentage_values):
            nutrient_percentages[f'{nutrient_name} Percent'] = percentage_values[i]
    
    for label in labels:
        label_text = label.get_text(strip=True)
        match_label = re.match(r'([a-zA-Z\s]+)([\d\.]+)(g|mg)?', label_text)
        if match_label:
            nutrient_name = match_label.group(1).strip()
            nutrient_value = float(match_label.group(2))
            if nutrient_name in nutrients:
                nutrients[nutrient_name] = nutrient_value
        
        if 'Includes' in label_text:
            match_added_sugars = re.search(r'Includes\s([\d\.]+)g\sAdded\sSugars', label_text)
            if match_added_sugars:
                added_sugars_value = float(match_added_sugars.group(1))
                nutrients['Added Sugars'] = added_sugars_value

    nutrients.update(nutrient_percentages)
    
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
        is_each = not 'oz' in serving_size.lower()
        return serving_size, is_each
    return None, False

def serving_based_nutrition(calories, protein, total_fat, total_carbohydrates, serving_size, is_each):
    try:
        serving_size_value = float(serving_size.split()[0])
    except (ValueError, IndexError):
        serving_size_value = 1.0
    
    is_high_protein = protein >= (calories/14) # Higher the denominator is, the stricter the cutoff for highprotein classification 
    is_high_fat = total_fat > 17.5 / 3.5
    is_high_carbs = total_carbohydrates >= 15
    
    if (not is_each):
        is_low_calorie = (calories / serving_size_value) < 80 
        is_high_calorie = (calories / serving_size_value) >= 100
    else:
        is_low_calorie = calories < 80
        is_high_calorie = calories >= 130

    return is_high_protein, is_high_fat, is_high_carbs, is_high_calorie, is_low_calorie
    

def cleanup_list_group(list_group):
    header, ul = list_group
    data_string = str(ul)
    
    pattern = r'<li[^>]*id="(\d+)"[^>]*>(.*?)<\/li>'
    
    matches = re.findall(pattern, data_string, re.DOTALL)
    
    data = [(match[0], html.unescape(match[1].strip()), header) for match in matches]
    
    return data
    
def link_firebase():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(current_directory, 'project-c2f87-firebase-adminsdk-v6ze4-5ec08aa368.json')
    cred = credentials.Certificate(path)
    firebase_admin.initialize_app(cred) 
    database = firestore.client()
    return database

def clear_firestore_collection(database, collection):
    collection_reference = database.collection(collection)
    docs = collection_reference.stream()
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
        
        is_high_protein, is_high_fat, is_high_carbs, is_high_calorie, is_low_calorie = serving_based_nutrition(calories, protein, total_fat, total_carbohydrates, serving_size, is_each)
        
        allergens_lower = set(item.strip().lower() for item in allergens)
        ingredients_lower = set(item.strip().lower() for item in ingredients)
        
        is_halal = "pork" not in allergens_lower and "pork" not in ingredients_lower and "bacon" not in ingredients_lower
        is_gluten_free = "wheat" not in allergens_lower and "Wheat" not in allergens_lower
        is_allergen_free = all(allergen == "" for allergen in allergens)
        
        non_vegan_ingredients = [
            "meat", "pork", "beef", "duck", "shrimp", "crab", "shellfish", "chicken", "fish", "egg", "eggs", "milk", 
            "cheese", "gelatin", "honey", "butter", "lard", "whey", "casein", "goat", "lamb", "mutton", "venison",
            "rabbit", "turkey", "bison", "buffalo", "veal", "clams", "oysters", "mussels", "scallops", "octopus", 
            "squid", "anchovy", "caviar", "cod", "herring", "lobster", "salmon", "sardine", "tilapia", "trout", 
            "tuna", "yogurt", "cream", "custard", "ghee", "margarine", "mayonnaise", "nougat", "suet", "tallow",
            "chorizo", "pepperoni", "bacon", "ham", "prosciutto", "sausage", "pâté", "foie gras", "kielbasa",
            "corned beef", "pastrami", "hot dog", "mortadella", "spam", "soppressata", "salami", "brisket", 
            "poultry", "wild game", "poultry fat", "beef broth", "chicken broth", "fish broth", "bone broth",
            "anchovies", "shellac", "isenglass", "carmine", "cochineal", "albumin", "broth", "broth powder",
            "caseinate", "rennet", "rennin", "meat stock", "meat extract", "meat flavor", "animal fat", 
            "animal rennet", "animal shortening", "animal stock", "bone char", "calcium caseinate", "caviar",
            "cheese curds", "cheese powder", "chicken fat", "duck fat", "emu oil", "fish gelatin", "fish oil", 
            "fish sauce", "fish stock", "gelatin hydrolysate", "goose fat", "ground meat", "hide glue", 
            "hydrolyzed animal protein", "hydrolyzed collagen", "hydrolyzed gelatin", "hydrolyzed protein", 
            "hydrolyzed silk", "isinglass", "keratin", "kosher gelatin", "lactose", "lactulose", "lamb fat",
            "lanolin", "lard oil", "leather", "meat flavoring", "meat meal", "meat stock powder", "milk powder",
            "milk protein", "mozzarella cheese", "mussels extract", "ox fat", "pepsin", "polypeptides",
            "protease", "provolone cheese", "pudding mix", "rabbit fat", "ribbon fish", "roe", "salmon oil",
            "shark cartilage", "shark liver oil", "shellfish extract", "shrimp extract", "sour cream", 
            "sour milk", "spleen extract", "sweet whey", "tilapia extract", "tripe", "turkey extract",
            "veal extract", "whey protein", "whey protein isolate", "whitefish", "whole egg powder",
            "whole milk powder", "wool fat", "wool wax", "yogurt powder", "albumen", "bone meal", 
            "catfish", "chicken powder", "cod liver oil", "crayfish", "crustaceans", "eel", "grouper", 
            "halibut", "herring oil", "lake trout", "meat juice", "meat tenderizer", "mollusks", 
            "monkfish", "omega-3 fatty acids", "pompano", "rockfish", "sablefish", "snapper", 
            "sole", "swordfish", "yellowtail", "yolk", "zooplankton", "byproducts", "lipase", 
            "semolina", "tuna oil", "beef tallow", "duck meat", "goat cheese", "turkey meat",
            "turkey broth", "meat flavorings", "oyster extract", "poultry broth", "fish gelatin",
            "goat meat", "mutton broth", "sheep milk", "sheep cheese", "clam extract", "crayfish extract"
        ]
        
        allergens_set = set(re.split(r'[\s,]+', ', '.join(allergens_lower)))
        ingredients_set = set(re.split(r'[\s,]+', ', '.join(ingredients_lower)))

        is_vegan = not any(animal_product in allergens_set or animal_product in ingredients_set for animal_product in non_vegan_ingredients)

        document_reference = collection_reference.document(dish_id)
        document_reference.set({
            'name': dish[1],
            'mealType': meal_type.lower(),
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
            'allergens': ingredients[0] if len(ingredients) > 0 else '',
            'ingredients': ingredients[1] if len(ingredients) > 1 else '',
            'serving_size': serving_size,
            'is_each': is_each,
            'is_high_calorie': is_high_calorie,
            'is_low_calorie': is_low_calorie,
            'is_high_protein': is_high_protein,
            'is_high_fat': is_high_fat,
            'is_high_carbs': is_high_carbs,
            'is_halal': is_halal,
            'is_gluten_free': is_gluten_free,
            'is_allergen_free': is_allergen_free,
            'is_vegan': is_vegan,
        })
        
        library_document_reference = library_collection_reference.document(dish_id)
        library_document_reference.set({
            'name': dish[1],
            'mealType': meal_type.lower(),
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
            'allergens': ingredients[0] if len(ingredients) > 0 else '',
            'ingredients': ingredients[1] if len(ingredients) > 1 else '',
            'serving_size': serving_size,
            'is_each': is_each,
            'is_high_calorie': is_high_calorie,
            'is_low_calorie': is_low_calorie,
            'is_high_protein': is_high_protein,
            'is_high_fat': is_high_fat,
            'is_high_carbs': is_high_carbs,
            'is_halal': is_halal,
            'is_gluten_free': is_gluten_free,
            'is_allergen_free': is_allergen_free,
            'is_vegan': is_vegan,
        })

if __name__ == "__main__":
    url1 = 'https://diningmenus.unt.edu/?locationID=20'
    
    list_groups = find_meal_of_day(url1)

    all_data = {'Breakfast': [], 'Lunch': [], 'Dinner': []}
    
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
