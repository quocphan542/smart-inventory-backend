# 🏭 Smart Internal Inventory & Supply Chain Management System

An enterprise-grade, high-throughput B2B Inventory Management System engineered to streamline internal warehouse logistics, track real-time physical stock movements, and automate corporate workflows while ensuring strict data security.

---

## 🚀 Key Architectural & Engineering Breakthroughs

### 1. High-Precision Stock Calculation Engine
*   **Normalized Database Schema:** Designed and structured a comprehensive **19-table schema** on SQL Server to manage complex supply chain relationships.
*   **Granular Location Matrix:** Engineered a real-time stock allocation matrix leveraging a **Composite Key** `[product_id + location_id + batch_number]`, ensuring 100% data accuracy down to precise physical coordinates (`Zone ──► Shelf ──► Bin`).
*   **Concurrency Control (Problem Solved):** Eradicated stock discrepancies by implementing **Optimistic Locking (`@Version`)** to completely block concurrent edit overwrites (Race Conditions) when multiple operators scan and update the same lot concurrently.

### 2. Mission-Critical Data Security & Masking
*   **Role-Based Access Control (RBAC):** Enforced strict access limits via Spring Security and JWT between **Admin** and **Warehouse Operator**.
*   **Financial Data Masking:** Engineered dynamic data-masking layers that **completely abstract and hide cost prices (`base_price`)** and financial totals from the Field Operators' UI, preserving corporate financial confidentiality.

### 3. Immutable Cryptographic Audit Trail
*   **Anti-Theft Ledger:** Developed an autonomous logging engine that captures every single stock delta (+/- quantity) into an **undeletable `inventory_logs` table**.
*   **Complete Telemetry:** Each log stamps the exact User ID, timestamp, and action reference code for absolute compliance and auditing.

### 4. Mathematical Engines
*   **Unit Conversion Engine:** Built a flexible mapping engine that automatically normalizes loose bulk supply orders (Pallets, Cases, Cartons) into base operational units (Pieces/Units) during inbound protocols based on configurable `factor` rates.

---

## 🎨 UI/UX Design Philosophy: Industrial Skeuomorphism

The Frontend is authored using **ReactJS & Tailwind CSS** reflecting an industrial environment layout:
*   **Tactile Feedback:** Heavy neumorphic dual-shadow inputs (`shadow-[inset_...]`) that mimic mechanical buttons, built for rugged real-world usage.
*   **LCD Telemetry:** High-contrast, custom-filtered dashboards wrapped in monospace telemetry fonts to highlight critical low-stock alerts.
*   **Responsive Morphing:** Instantly morphs from data-dense desktop admin panels into single-column, touch-friendly cards optimized for warehouse barcode scanning tablets.

---

## 🛠️ Tech Stack & Systems

*   **Backend Core:** Java 17, Spring Boot 3.x, Spring Data JPA, Spring Security (JWT), Hibernate Core
*   **Data Layer:** Microsoft SQL Server (**In-Memory OLTP** for high-throughput authentication)
*   **Frontend Core:** ReactJS, Tailwind CSS, JavaScript (ES6), Axios
*   **DevOps & Infrastructure:** Docker (Multi-Stage Builds), Nginx (Reverse Proxy), GitHub Actions, SSL/TLS

---

## 📦 Architecture & Deployment Structure
[ Client Browser (HTTPS) ]
                             │
                             ▼
                 [ Nginx Web Server (Port 443) ]
                             │
    ┌────────────────────────┴────────────────────────┐
    ▼ (Serve Static Files)                            ▼ (Reverse Proxy)
    [ ReactJS UI Frontend ]                       [ Spring Boot API (Port 8080) ]
│
▼
[ SQL Server Database ]
(Includes In-Memory Tables)
|---

## ⚙️ Getting Started & Installation (Docker Deployment)

This project is fully containerized using **Docker Multi-Stage Builds**, reducing the production container footprint by **70%** (from 500MB+ down to ~150MB).

### Prerequisites
*   Docker & Docker Compose installed.
*   SQL Server instance or running inside Docker container.

### 1. Clone the repository
```bash
git clone [https://github.com/quocphan542/your-repo-name.git](https://github.com/quocphan542/your-repo-name.git)
cd your-repo-name
