# # # {/* <div className="user-section">
# # #             <div className="user-info">
# # #               <User size={18} />
# # #               <span>{user?.email}</span>
# # #             </div>
# # #             <button className="logout-btn" onClick={handleLogout}>
# # #               <LogOut size={18} />
# # #               Logout
# # #             </button>
# # #           </div>
# # #         </div>



# # #         // abc@gmail.com
# # #         // P@ssw0rd */}


# # import requests

# # url = "http://127.0.0.1:8080/api/analyze"

# # headers = {
# #     "Authorization": "Bearer YOUR_REAL_JWT_TOKEN",
# #     "Content-Type": "application/json"
# # }

# # payload = {
# #     "symbol": "AAPL"
# # }

# # response = requests.post(url, json=payload, headers=headers)

# # print("Status:", response.status_code)
# # print("Body:", response.text)

# # import jwt

# # JWT_SECRET = "your_secret_key_here"

# # token = jwt.encode(
# #     {"user_id": 1},
# #     JWT_SECRET,
# #     algorithm="HS256"
# # )

# # print(token)

# import requests

# import jwt

# JWT_SECRET = "your-super-secret-key-change-this-in-production"

# token = jwt.encode({"user_id": 1}, JWT_SECRET, algorithm="HS256")
# print(token)

# url = "http://127.0.0.1:8080/api/analyze"

# headers = {
#     "Authorization": token,
#     "Content-Type": "application/json"
# }


# payload = {
#     "symbol": "SYPNL",
#     "rsi_period": 14
# }

# response = requests.post(url, json=payload, headers=headers)

# print("Status:", response.status_code)
# print("Body:", response.text)

