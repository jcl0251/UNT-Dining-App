import re
from bs4 import BeautifulSoup
import requests
import csv


def scrapeBreakfast(url):
    response = requests.get(url)
    content = response.text
    soup = BeautifulSoup(content, 'html.parser')
    #print(soup.prettify())
    box = soup.find('ul', class_='list-group')
    return box

# JUST FOR TESTING
def printBreakfastList(data):
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
        
def exportToCSV(data):
    with open('diningData.csv', 'w', newline='') as csvfile:
        fieldnames = ['Breakfast Dishes']
        myWriter = csv.DictWriter(csvfile, fieldnames=fieldnames)
        myWriter.writeheader()
        
        
        if data:
            # Convert data to string
            data_string = str(data)
            
            # Define your pattern to match <li> tags
            pattern = r'<li[^>]*>(.*?)<\/li>'
            
            # Find all matches using regular expressions
            matches = re.findall(pattern, data_string, re.DOTALL)
            
        for match in matches:
            stripped_match = match.strip()
            myWriter.writerow({'Breakfast Dishes':stripped_match})
    
    
if __name__ == "__main__":
    website = 'https://diningmenus.unt.edu/?locationID=20'
    breakfastData = scrapeBreakfast(website)

    printBreakfastList(breakfastData)
    exportToCSV(breakfastData)
    #input("\nPress Enter to close...") #Just for testing with executable
