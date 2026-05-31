import pandas as pd
from prophet import Prophet
from sqlalchemy import create_engine, text
import warnings

# Tắt các cảnh báo không cần thiết từ Prophet
warnings.filterwarnings('ignore', category=FutureWarning)

# --- 1. CẤU HÌNH KẾT NỐI DATABASE ---
# Thay đổi các thông số này cho khớp với SQL Server của bạn
DB_CONFIG = {
    'server': 'localhost',
    'database': 'SmartInventoryDB',
    'username': 'sa',
    'password': 'Thuan@230901',
    'driver': 'ODBC Driver 17 for SQL Server' # Đảm bảo bạn đã cài driver này
}

# Tạo chuỗi kết nối
connection_string = (
    f"mssql+pyodbc://{DB_CONFIG['username']}:{DB_CONFIG['password']}@"
    f"{DB_CONFIG['server']}/{DB_CONFIG['database']}?driver={DB_CONFIG['driver'].replace(' ', '+')}"
)
engine = create_engine(connection_string)

print("✅ Đã kết nối tới Database thành công!")

# --- 2. LẤY DỮ LIỆU LỊCH SỬ BÁN HÀNG ---
# Lấy dữ liệu từ bảng `inventory_issues` và `issue_details`
# Chúng ta cần ngày bán (issued_date) và số lượng bán (quantity)
query = """
SELECT
    i.issued_date,
    d.product_id,
    d.quantity
FROM
    inventory_issues i
JOIN
    issue_details d ON i.id = d.issue_id
ORDER BY
    i.issued_date;
"""

try:
    with engine.connect() as connection:
        df_sales = pd.read_sql(query, connection)
    print(f"✅ Lấy thành công {len(df_sales)} dòng dữ liệu lịch sử bán hàng.")
except Exception as e:
    print(f"❌ Lỗi khi lấy dữ liệu: {e}")
    exit()

# --- 3. XỬ LÝ DỮ LIỆU & HUẤN LUYỆN MODEL ---
# Đổi tên cột cho phù hợp với yêu cầu của Prophet ('ds' cho ngày tháng, 'y' cho giá trị cần dự báo)
df_sales.rename(columns={'issued_date': 'ds', 'quantity': 'y'}, inplace=True)

# Lấy danh sách các sản phẩm đã bán
unique_product_ids = df_sales['product_id'].unique()
print(f"🔎 Tìm thấy {len(unique_product_ids)} sản phẩm cần dự báo.")

all_forecasts = []

for product_id in unique_product_ids:
    print(f"\n--- Đang xử lý sản phẩm ID: {product_id} ---")

    # Lọc dữ liệu cho từng sản phẩm
    df_product = df_sales[df_sales['product_id'] == product_id][['ds', 'y']]

    # Prophet yêu cầu ít nhất 2 dòng dữ liệu để học
    if len(df_product) < 2:
        print("   ⚠️ Dữ liệu không đủ để dự báo, bỏ qua sản phẩm này.")
        continue

    # Khởi tạo và huấn luyện model Prophet
    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=True, # Nhận biết xu hướng theo tuần (ví dụ: cuối tuần bán chạy hơn)
        yearly_seasonality=True, # Nhận biết xu hướng theo năm (ví dụ: mùa hè bán chạy hơn)
        changepoint_prior_scale=0.05
    )
    model.fit(df_product)

    # Tạo một dataframe cho tương lai để dự báo (ví dụ: 30 ngày tới)
    future = model.make_future_dataframe(periods=30)

    # Thực hiện dự báo
    forecast = model.predict(future)

    # Lấy kết quả dự báo của 30 ngày tới
    predicted_demand = forecast.iloc[-30:]['yhat'].sum()

    # Lấy độ tin cậy (ví dụ: lấy giá trị trung bình của khoảng tin cậy)
    # Đây là một cách tính đơn giản, có thể cải thiện sau
    confidence = 1 - ((forecast['yhat_upper'] - forecast['yhat_lower']) / forecast['yhat']).mean()

    print(f"   📈 Dự báo 30 ngày tới: {predicted_demand:.0f} sản phẩm.")
    print(f"   🎯 Độ tin cậy (ước tính): {confidence:.2%}")

    # Thêm kết quả vào danh sách
    all_forecasts.append({
        'product_id': product_id,
        'forecast_date': pd.to_datetime('today').date() + pd.DateOffset(days=30),
        'predicted_demand': int(round(predicted_demand)),
        'confidence_interval': round(confidence * 100, 2)
    })

# --- 4. LƯU KẾT QUẢ VÀO DATABASE ---
if all_forecasts:
    df_to_save = pd.DataFrame(all_forecasts)

    try:
        with engine.connect() as connection:
            # Xóa các dự báo cũ đi
            connection.execute(text("TRUNCATE TABLE ai_demand_forecasts;"))
            print("\n✅ Đã xóa các dự báo cũ.")

            # Lưu các dự báo mới vào bảng
            df_to_save.to_sql('ai_demand_forecasts', con=connection, if_exists='append', index=False)
            print(f"✅ Đã lưu thành công {len(df_to_save)} dự báo mới vào database!")

    except Exception as e:
        print(f"❌ Lỗi khi lưu kết quả vào database: {e}")
else:
    print("\n⚠️ Không có dự báo nào được tạo ra.")

print("\n--- HOÀN TẤT ---")