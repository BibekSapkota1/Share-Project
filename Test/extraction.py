import requests
import pandas as pd
from bs4 import BeautifulSoup

def fetch_history(symbol, days=180):
    base_url = "https://www.sharesansar.com/company/"
    url = f"{base_url}{symbol}"

    all_rows = []

    page = 1
    while len(all_rows) < days:
        res = requests.get(f"{url}?page={page}")
        soup = BeautifulSoup(res.text, 'html.parser')

        table = soup.find("table", {"class": "table"})
        rows = table.find("tbody").find_all("tr")

        for r in rows:
            cols = [c.text.strip() for c in r.find_all("td")]
            if len(cols) >= 5:
                all_rows.append(cols)

        page += 1

    df = pd.DataFrame(all_rows[:days], 
                      columns=["Date", "Open", "High", "Low", "Close", "Volume"])

    return df

df = fetch_history("ADBL", 180)
print(df)
