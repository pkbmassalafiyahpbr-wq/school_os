# School OS Demo Platform
## Architecture Blueprint & Implementation Blueprint
### Presentation Prototype for SDN 1 Siliasih

---

# Purpose

Dokumen ini menjadi pedoman implementasi **School OS Demo Platform** yang akan digunakan pada simulasi rapat bersama Kepala Sekolah dan Guru SDN 1 Siliasih.

Target utama demo **bukan membangun sistem production**, melainkan memberikan pengalaman penggunaan yang realistis sehingga seluruh stakeholder dapat memahami bagaimana School OS akan bekerja ketika selesai dikembangkan.

---

# Demo Objectives

Demo harus mampu menunjukkan satu siklus pembelajaran secara utuh.

```
Guru
    │
    ▼
Membuat Materi
    │
    ▼
Publish
    │
    ▼
Siswa menerima materi
    │
    ▼
Siswa belajar
    │
    ▼
Siswa mengerjakan Quiz
    │
    ▼
Nilai tersimpan
    │
    ▼
Guru melihat hasil
    │
    ▼
Kepala Sekolah melihat dashboard
```

Seluruh proses tersebut harus dapat dilakukan tanpa konfigurasi tambahan.

---

# Development Principle

Demo harus:

- Mudah dijalankan
- Tidak membutuhkan internet
- Database lokal
- Cepat
- Mudah dipindahkan ke laptop lain
- Data dapat diedit selama presentasi
- Tampilan menyerupai aplikasi production

---

# Technology Stack

## Frontend

Next.js

React

TypeScript

TailwindCSS

TanStack Query

React Hook Form

Zod

---

## Backend

Next.js Route Handler

SQLite

better-sqlite3

---

## Future Production

Rust

Axum

SQLx

PostgreSQL

JWT

Redis

Object Storage

---

# High Level Architecture

```
                   Browser

                       │

                       ▼

                Next.js Frontend

                       │

                       ▼

             Route Handler (API)

                       │

                       ▼

               Service Layer

                       │

                       ▼

            SQLite Repository

                       │

                       ▼

                 school.db
```

---

# Clean Architecture

```
app/

components/

features/

services/

repositories/

database/

lib/

types/

hooks/

stores/
```

---

# Feature Architecture

```
features

├── authentication
├── dashboard
├── teacher
├── student
├── materials
├── assignment
├── quiz
├── attendance
├── report
├── notification
└── principal
```

Setiap feature berdiri sendiri sehingga mudah dipindahkan ke backend Rust di masa depan.

---

# Folder Structure

```
school-os-demo/

app/

components/

features/

database/

repositories/

services/

lib/

public/

types/

scripts/

school.db

README.md
```

---

# SQLite Database

Database cukup menggunakan satu file.

```
school.db
```

Tidak membutuhkan server.

---

# Database Tables

```
users

teachers

students

classrooms

subjects

materials

assignments

quizzes

questions

choices

quiz_attempts

student_answers

attendance

scores

notifications
```

---

# User Role

```
Administrator

Guru

Siswa

Kepala Sekolah
```

---

# Login Flow

```
Login

↓

Select Role

↓

Dashboard sesuai role
```

Tidak menggunakan autentikasi production.

Login cukup menggunakan akun dummy.

---

# Teacher Flow

```
Dashboard

↓

Pilih Mata Pelajaran

↓

Tambah Materi

↓

Upload PDF

↓

Tambah Video

↓

Publish

↓

Materi muncul ke siswa
```

---

# Student Flow

```
Dashboard

↓

Materi Baru

↓

Belajar

↓

Video

↓

Quiz

↓

Submit

↓

Nilai
```

---

# Principal Flow

```
Dashboard

↓

Jumlah Guru

↓

Jumlah Siswa

↓

Materi Hari Ini

↓

Quiz Hari Ini

↓

Grafik Aktivitas

↓

Laporan
```

---

# Dashboard Components

## Teacher

- Statistik
- Jadwal
- Materi
- Quiz
- Assignment
- Activity

---

## Student

- Progress Belajar
- Jadwal
- Materi Terbaru
- Quiz
- Nilai
- Achievement

---

## Principal

- Statistik Sekolah
- Guru Aktif
- Kehadiran
- Nilai
- Grafik
- Aktivitas

---

# UI Principles

Gunakan tampilan yang bersih.

```
Card

Table

Dialog

Drawer

Toast

Badge

Progress

Chart

Timeline
```

Hindari tampilan yang terlalu penuh.

---

# Dummy Assets

Siapkan:

- Logo sekolah
- Foto guru
- Foto siswa
- PDF pembelajaran
- Video pembelajaran
- Jadwal
- Nilai
- Badge

Sehingga demo terasa realistis.

---

# Demo Scenario

## Skenario 1

Guru login.

↓

Upload materi.

↓

Publish.

↓

Logout.

↓

Siswa login.

↓

Materi muncul.

↓

Belajar.

↓

Kerjakan Quiz.

↓

Submit.

↓

Logout.

↓

Guru login.

↓

Melihat nilai.

↓

Logout.

↓

Kepala sekolah login.

↓

Dashboard berubah.

---

# Sample Data

Guru

```
Bu Siti

Pak Ahmad

Bu Rina
```

---

Kelas

```
1A

2A

3A

4A

5A

6A
```

---

Siswa

```
30 siswa
```

---

Quiz

```
5 soal
```

---

Materi

```
Matematika

IPA

Bahasa Indonesia

PKn

SBdP
```

---

# UI Pages

```
Login

Dashboard

Teacher Dashboard

Student Dashboard

Principal Dashboard

Material

Material Detail

Assignment

Quiz

Quiz Result

Attendance

Report

Profile
```

---

# Repository Pattern

```
TeacherRepository

StudentRepository

MaterialRepository

QuizRepository

AssignmentRepository

DashboardRepository
```

Seluruh query SQLite berada pada repository.

---

# Service Layer

```
TeacherService

StudentService

QuizService

MaterialService

DashboardService
```

Seluruh business logic berada di service.

---

# API Layer

```
GET /api/dashboard

GET /api/materials

POST /api/material

GET /api/quizzes

POST /api/quiz

POST /api/submit

GET /api/report
```

---

# Data Flow

```
Browser

↓

API

↓

Service

↓

Repository

↓

SQLite

↓

Repository

↓

Service

↓

API

↓

Browser
```

---

# Design System

Gunakan konsisten:

- Radius besar
- Shadow ringan
- Warna primer sekolah
- Ikon sederhana
- Typography modern
- Spacing konsisten

---

# Development Roadmap

## Sprint 1

- Setup Project
- SQLite
- Layout
- Sidebar
- Login

---

## Sprint 2

- Dashboard Guru
- Dashboard Siswa
- Dashboard Kepala Sekolah

---

## Sprint 3

- Materi
- Upload
- Quiz
- Nilai

---

## Sprint 4

- Statistik
- Grafik
- Report
- Finishing

---

# Future Migration

Seluruh arsitektur demo dirancang agar mudah dimigrasikan ke production.

```
Demo

SQLite

↓

Production

PostgreSQL
```

```
Next.js Route

↓

Rust API
```

```
Repository

↓

SQLx Repository
```

```
Service

↓

Tetap digunakan
```

Dengan demikian, kode frontend dapat dipertahankan sementara backend diganti secara bertahap menggunakan Rust tanpa mengubah alur aplikasi.

---

# Success Criteria

Demo dianggap berhasil apabila selama rapat dapat memperlihatkan:

- Guru dapat membuat materi.
- Guru dapat membuat kuis.
- Siswa dapat mempelajari materi.
- Siswa dapat mengerjakan kuis.
- Nilai tersimpan.
- Dashboard guru berubah.
- Dashboard kepala sekolah menampilkan statistik terbaru.

---

# Long-Term Vision

Prototype ini merupakan langkah awal menuju implementasi penuh School OS sebagai platform terpadu administrasi akademik dan pembelajaran digital SDN 1 Siliasih. Arsitektur yang digunakan pada demo sengaja disusun menyerupai arsitektur production agar proses migrasi ke backend Rust, PostgreSQL, autentikasi JWT, serta fitur enterprise lainnya dapat dilakukan secara bertahap tanpa perlu melakukan penulisan ulang pada sisi frontend.