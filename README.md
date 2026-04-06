# Customer360 TV App

Customer360 TV App là đồ án xây dựng hệ thống phân tích khách hàng end-to-end cho dữ liệu log sử dụng dịch vụ TV.

## Mục tiêu

- ingest dữ liệu log thô
- ETL dữ liệu trên Databricks theo mô hình Bronze → Silver → Gold
- đưa dữ liệu Gold sang Supabase làm serving layer
- xây dựng ứng dụng Customer 360 bằng Next.js
- deploy online bằng Vercel

## Kiến trúc

```text
Raw JSON Logs
   ↓
Databricks
(Bronze → Silver → Gold)
   ↓
Supabase
(serving database)
   ↓
Next.js + Vercel
(Customer 360 web app)