import schedule
import time
from datetime import datetime

# Define the function you want to run
def job():
    print(f"Task is running at {datetime.now()}")

# Schedule the job
# You can use a variety of options for scheduling:
schedule.every(10).seconds.do(job)
# schedule.every().hour.do(job)
# schedule.every().day.at("10:30").do(job)
# schedule.every().wednesday.at("13:15").do(job)

# Keep the script running to check for pending jobs
while True:
    schedule.run_pending()
    time.sleep(1) # Sleep for a short time to avoid high CPU usage


# i have make my all code in app.jsx now i need to split the code in this format as i have given u in above image, and in tradecycle list the lastest trade should be in up not by cycle 1 or 2, and also Holding.jsx is a new page where user see all his holding information with details of their sale, u can make it custom as your self.