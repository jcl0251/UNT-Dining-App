import re
from bs4 import BeautifulSoup
import requests
import csv
import html
import sqlite3

# Function that utilizes BeautifulSoup and Requests to fetch and parse a site
def scrape(url):
    print(f"Fetching URL: {url}")
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

#def scrape_breakfast(url):
    soup = scrape(url) 
    box = soup.find('ul', class_='list-group')
    return box

# JUST FOR TESTING
#def print_breakfast_list(data):
    if data:
        # Convert data to string
        data_string = str(data)
        
        # Define your pattern to match <li> tags
        pattern = r'<li[^>]*>(.*?)<\/li>'
        
        # Find all matches using regular expressions
        matches = re.findall(pattern, data_string, re.DOTALL)
        
        # Print the matches
        for match in matches:
            stripped_match = match.strip()
            print(stripped_match)
    else:
        print("Data not found.")

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
    print(f"Raw data for header '{header}':")
    for item in data:
        print(item)
    
    return data

# Function that utilizes the CSV library to write a file for each respective meal type that contains 
# Individual meals of that respective (meal type / meal of the day)
#def export_to_CSV(data, meal_type):
    filename = f'{meal_type}_diningData.csv'
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = [f'{meal_type} Dishes']
        my_writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        my_writer.writeheader()
            
        for row in data: # For loop that puts each Dish into CSV file
            my_writer.writerow({f'{meal_type} Dishes': row['Dish']})
            
#def export_to_CSV(data, meal_type):
    filename = f'{meal_type}_diningData.csv'
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['ID', f'{meal_type} Dishes']
        my_writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        my_writer.writeheader()
        
        for dish_id, dish_name in data.items(): # For loop that puts each Dish into CSV file
            my_writer.writerow({'ID': dish_id, f'{meal_type} Dishes': dish_name})
            
def create_database():
    connection = sqlite3.connect('dining.db') # Connects to database 
    c = connection.cursor()
    c.execute('DROP TABLE IF EXISTS breakfast')
    c.execute('DROP TABLE IF EXISTS lunch')
    c.execute('DROP TABLE IF EXISTS dinner')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS breakfast (
                id INTEGER PRIMARY KEY,
                name TEXT,
                header TEXT
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS lunch (
                id INTEGER PRIMARY KEY,
                name TEXT,
                header TEXT
        )
    ''')
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS dinner (
                id INTEGER PRIMARY KEY,
                name TEXT,
                header TEXT
        )
    ''')
    
    connection.commit()
    connection.close()
    
def input_data(data, meal_type):
    connection = sqlite3.connect('dining.db') # Connects to database
    c = connection.cursor() 
    table_name = meal_type.lower()
    for dish in data:
        try:
            sql = f'''
                INSERT INTO {table_name} (id, name, header)
                VALUES (?, ?, ?)   
            '''
            c.execute(sql, (dish[0], dish[1], dish[2]))
        except sqlite3.IntegrityError:
            print(f"Dish ID {dish[0]} already exists in {table_name}. Going on without adding")
        
    connection.commit()
    connection.close()
    
    
if __name__ == "__main__":
    website = 'https://diningmenus.unt.edu/?locationID=20'
    list_groups = find_meal_of_day(website)

    all_data = {'Breakfast': [], 'Lunch': [], 'Dinner': []}
    
    create_database()
    
    for meal_type, groups in list_groups.items():
        print(f"Processing {meal_type}")
        for list_group in groups:
            data = cleanup_list_group(list_group)
            all_data[meal_type].extend(data)
            
        for meal_type, data in all_data.items():
            input_data(data, meal_type)
            #export_to_CSV(data, meal_type)
    #input("\nPress Enter to close...") #Just for testing with executable