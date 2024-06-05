import re
from bs4 import BeautifulSoup
import requests

website = 'https://diningmenus.unt.edu/?locationID=20'
result = requests.get(website)
content = result.text
soup = BeautifulSoup(content, 'html.parser')
#print(soup.prettify())

box = soup.find('ul', class_='list-group')
print(box)

for tag in soup.findAll(re.compile("^</li>")):
    print(tag.name)