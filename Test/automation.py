import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

def scrape_share_sansar():
    # Setup Chrome Options
    chrome_options = Options()
    # chrome_options.add_argument("--headless")  # Uncomment to run without opening browser window

    # Initialize Driver
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    url = "https://www.sharesansar.com/today-share-price"
    
    try:
        driver.get(url)
        print(f"Accessing {url}...")

        # 1. Wait until the table is loaded (waiting for the 'S.No' column or rows)
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.ID, "head-obj")))

        # 2. Extract Table Headers
        headers = []
        thead = driver.find_element(By.XPATH, "//table[@id='head-obj']/thead")
        for th in thead.find_elements(By.TAG_NAME, "th"):
            headers.append(th.text.strip())

        # 3. Extract Table Rows
        data = []
        # Find the table body (Note: ShareSansar often uses a specific ID for the table)
        table_rows = driver.find_elements(By.XPATH, "//table[@id='head-obj']/tbody/tr")

        print(f"Found {len(table_rows)} rows. Extracting data...")

        for row in table_rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) > 0:
                row_data = [cell.text.strip() for cell in cells]
                data.append(row_data)

        # 4. Create DataFrame
        df = pd.DataFrame(data, columns=headers)
        
        # Cleanup column names (remove newlines if any)
        df.columns = [col.replace('\n', ' ') for col in df.columns]
        
        return df

    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    finally:
        driver.quit()

if __name__ == "__main__":
    df_stocks = scrape_share_sansar()
    
    if df_stocks is not None:
        print(df_stocks.head()) # Show first 5 rows
        df_stocks.to_csv("today_share_price.csv", index=False)
        print("\nData saved to 'today_share_price.csv'")