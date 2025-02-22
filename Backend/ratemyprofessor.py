import os
import time
import json
import re
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import NoSuchElementException, ElementClickInterceptedException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# Set up the WebDriver
options = Options()
options.add_argument("--incognito")
options.add_argument("--ignore-certificate-errors")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
driver.maximize_window()

def scrape_professor_links(url):
    print("Starting professor link scraping...")
    driver.set_page_load_timeout(300)  # 5 minutes timeout
    driver.get(url)

    try:
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//div[starts-with(@class, 'FullPageModal__')]//button"))
        ).click()
    except Exception as e:
        print("No cookie popup found:", e)

    # Handle ad popups
    try:
        WebDriverWait(driver, 5).until(EC.element_to_be_clickable((By.XPATH, "//a[@id='bx-close-inside-1177612']"))).click()
    except:
        print("Ad popup not found or already closed.")

    # Click "Show More" until all results are loaded
    show_more_button_xpath = "//button[text()='Show More']"
    while True:
        try:
            time.sleep(0.5)
            show_more_button = driver.find_element(By.XPATH, show_more_button_xpath)
            driver.execute_script("arguments[0].scrollIntoView();", show_more_button)
            driver.execute_script("window.scrollBy(0, -500);")
            show_more_button.click()
            print("Clicked 'Show More' button")
        except ElementClickInterceptedException:
            print("Element is blocked by another element (likely an ad).")
            time.sleep(2)
        except NoSuchElementException:
            print("No more 'Show More' button found.")
            break

    # Scrape professor links
    professors_data = []
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')

    for link in soup.find_all('a', class_='TeacherCard__StyledTeacherCard-syjs0d-0 dLJIlx'):
        professor = link.find('div', class_='CardName__StyledCardName-sc-1gyrgim-0')
        professor_name = professor.get_text(strip=True) if professor else "Unknown"
        href = link.get("href")
        full_link = f"https://www.ratemyprofessors.com{href}"
        professors_data.append({
            "name": professor_name,
            "rmp_link": full_link
        })

    print(f"Scraped {len(professors_data)} professor links.")
    return professors_data

def fetch_rating_distributions(full_link):
    response = requests.get(full_link)
    soup = BeautifulSoup(response.text, 'html.parser')

    script_tag = soup.find('script', string=re.compile('window.__RELAY_STORE__'))
    if not script_tag:
        return None
        
    json_str = re.search(r'window\.__RELAY_STORE__\s*=\s*({.*?});', script_tag.string, re.DOTALL).group(1)
    data = json.loads(json_str)

    rating_distributions = None
    for key, value in data.items():
        if isinstance(value, dict) and value.get('__typename') == 'ratingsDistribution':
            rating_distributions = value
            break

    return rating_distributions

def test_supabase_connection():
    try:
        # Test the connection by fetching a single row
        response = supabase.table('professors').select("*").limit(1).execute()
        print("Successfully connected to Supabase!")
        print("Sample data:", response.data)
        return True
    except Exception as e:
        print("Error connecting to Supabase:", str(e))
        return False

def main():
    # Test connection first
    if not test_supabase_connection():
        print("Exiting due to connection error")
        return

    BASE_URL = "https://www.ratemyprofessors.com/search/professors/971?q=*&did=11"
    
    # Scrape professor links
    professors_data = scrape_professor_links(BASE_URL)
    
    # Fetch and store rating distributions for each professor
    for professor in professors_data:
        print(f"Fetching ratings for {professor['name']}")
        
        rating_distributions = fetch_rating_distributions(professor['rmp_link'])
        if rating_distributions:
            professor_data = {
                "name": professor['name'],
                "rmp_link": professor['rmp_link'],
                "rating_1_count": rating_distributions.get('r1', 0),
                "rating_2_count": rating_distributions.get('r2', 0),
                "rating_3_count": rating_distributions.get('r3', 0),
                "rating_4_count": rating_distributions.get('r4', 0),
                "rating_5_count": rating_distributions.get('r5', 0),
            }
            
            try:
                # Check if professor exists
                existing = supabase.table('professors').select("*").eq('name', professor['name']).execute()
                
                if existing.data:
                    # Update existing professor
                    supabase.table('professors').update(professor_data).eq('name', professor['name']).execute()
                else:
                    # Insert new professor
                    supabase.table('professors').insert(professor_data).execute()
                
                print(f"Stored ratings for {professor['name']}")
            except Exception as e:
                print(f"Error storing data for {professor['name']}: {str(e)}")
        else:
            print(f"No rating distributions found for {professor['name']}")

    print("Completed scraping and storing professor data.")

if __name__ == "__main__":
    main()
    driver.quit()
