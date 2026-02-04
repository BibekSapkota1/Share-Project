# # import pandas as pd
# # from io import StringIO

# # def calculate_rsi(data, period=14):
# #     delta = data.diff()
# #     gain = delta.where(delta > 0, 0).rolling(period).mean()
# #     loss = -delta.where(delta < 0, 0).rolling(period).mean()
# #     rs = gain / loss
# #     return 100 - (100 / (1 + rs))


# # csv_data = """Date,Close
# # 27/01/2026,304.5
# # 26/01/2026,307
# # 25/01/2026,307.5
# # 22/01/2026,304
# # 21/01/2026,306.9
# # 20/01/2026,307.9
# # 18/01/2026,304.8
# # 14/01/2026,300
# # 13/01/2026,298
# # 12/01/2026,299.5
# # 08/01/2026,300
# # 07/01/2026,299.7
# # 06/01/2026,297.4
# # 05/01/2026,293
# # 04/01/2026,292
# # 01/01/2026,295
# # 31/12/2025,298
# # 29/12/2025,294.4
# # 28/12/2025,297
# # 24/12/2025,288
# # 23/12/2025,286.9
# # 22/12/2025,288.8
# # """

# # df = pd.read_csv(StringIO(csv_data))
# # df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
# # df = df.sort_values('Date')

# # df['RSI_14'] = calculate_rsi(df['Close'], 14)

# # print(df)


# import pandas as pd
# from io import StringIO

# # Function to calculate RSI with all intermediate values
# def calculate_rsi_full(data, period=14):
#     delta = data.diff()
    
#     # Gains and losses
#     gain = delta.where(delta > 0, 0)
#     loss = -delta.where(delta < 0, 0)
    
#     # Rolling averages of gains and losses
#     avg_gain = gain.rolling(period).mean()
#     avg_loss = loss.rolling(period).mean()
    
#     # Relative Strength
#     rs = avg_gain / avg_loss
    
#     # RSI
#     rsi = 100 - (100 / (1 + rs))
    
#     return gain, loss, avg_gain, avg_loss, rs, rsi

# # Your CSV data
# csv_data = """Date,Close
# 27/01/2026,304.5
# 26/01/2026,307
# 25/01/2026,307.5
# 22/01/2026,304
# 21/01/2026,306.9
# 20/01/2026,307.9
# 18/01/2026,304.8
# 14/01/2026,300
# 13/01/2026,298
# 12/01/2026,299.5
# 08/01/2026,300
# 07/01/2026,299.7
# 06/01/2026,297.4
# 05/01/2026,293
# 04/01/2026,292
# 01/01/2026,295
# 31/12/2025,298
# 29/12/2025,294.4
# 28/12/2025,297
# 24/12/2025,288
# 23/12/2025,286.9
# 22/12/2025,288.8
# """

# # Read CSV and sort by date
# df = pd.read_csv(StringIO(csv_data))
# df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
# df = df.sort_values('Date')

# # Calculate all RSI components
# gain, loss, avg_gain, avg_loss, rs, rsi = calculate_rsi_full(df['Close'], 14)

# # Add columns to the DataFrame
# df['Gain'] = gain
# df['Loss'] = loss
# df['Avg_Gain'] = avg_gain
# df['Avg_Loss'] = avg_loss
# df['RS'] = rs
# df['RSI_14'] = rsi

# print(df)


