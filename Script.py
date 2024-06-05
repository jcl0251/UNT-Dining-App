import re
from bs4 import BeautifulSoup
import requests

website = 'https://diningmenus.unt.edu/?locationID=20'
result = requests.get(website)
content = result.text
soup = BeautifulSoup(content, 'html.parser')
#print(soup.prettify())

box = soup.find('ul', class_='list-group')

if box:
    # Convert box to string
    box_string = str(box)
    
    # Define your pattern to match <li> tags
    pattern = r'<li[^>]*>(.*?)<\/li>'
    
    # Find all matches using regular expressions
    matches = re.findall(pattern, box_string, re.DOTALL)
    
    # Print the matches
    for match in matches:
        print(match)
else:
    print("Box not found.")
