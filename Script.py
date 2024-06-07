import re
from bs4 import BeautifulSoup
import requests
import csv
import html

def scrape(url):
    print(f"Fetching URL: {url}")
    response = requests.get(url)
    content = response.text
    soup = BeautifulSoup(content, 'html.parser')
    return soup


def find_meal_of_day(url):
    soup = scrape(url)
    
    meals_of_day = {
        'Breakfast': soup.find(id='breakfast'),
        'Lunch': soup.find(id='lunch'),
        'Dinner': soup.find(id='dinner')
    }
    
    list_groups = {}
    
    for meal_type, meal_of_day in meals_of_day.items():
        if meal_of_day:
            list_groups[meal_type] = meal_of_day.find_all('ul', class_='list-group')
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
        
def cleanup_list_group(list_group):
    data_string = str(list_group)
            
    # Define your pattern to match <li> tags
    pattern = r'<li[^>]*>(.*?)<\/li>'
    
    # Find all matches using regular expressions
    matches = re.findall(pattern, data_string, re.DOTALL)
    
    data = [{'Dish': html.unescape(match.strip())} for match in matches]
    
    return data
        
def export_to_CSV(data, meal_type):
    filename = f'{meal_type}_diningData.csv'
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = [f'{meal_type} Dishes']
        my_writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        my_writer.writeheader()
            
        for row in data:
            my_writer.writerow({f'{meal_type} Dishes': row['Dish']})
    
    
    
    
if __name__ == "__main__":
    website = 'https://diningmenus.unt.edu/?locationID=20'
    list_groups = find_meal_of_day(website)

    all_data = {'Breakfast': [], 'Lunch': [], 'Dinner': []}
    
    for meal_type, groups in list_groups.items():
        #print(f"Processing {meal_type}")
        for list_group in groups:
            data = cleanup_list_group(list_group)
            all_data[meal_type].extend(data)
            
        for meal_type, data in all_data.items():
            export_to_CSV(data, meal_type)
    #input("\nPress Enter to close...") #Just for testing with executable
