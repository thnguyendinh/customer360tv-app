# Customer360 TV App

Customer360 TV App is an end-to-end customer analytics project built for television usage data.  
The system ingests raw log data, processes it in Databricks, serves curated datasets through Supabase, and delivers a Customer 360 web application with Next.js.

## Live Demo

**Production URL:**  
`https://customer360tv-app.vercel.app`

## Overview

This project was developed as a Customer 360 MVP for analyzing customer behavior and television channel usage.

The main objectives are:

- ingest raw TV usage logs
- transform data using a medallion architecture
- build customer-centric analytics tables
- serve the processed data through Supabase
- visualize insights in a web application deployed on Vercel

## Architecture

```text
Raw JSON Logs
   ↓
Databricks
(Bronze → Silver → Gold)
   ↓
Supabase
(serving layer / application database)
   ↓
Next.js + Vercel
(Customer 360 web application)