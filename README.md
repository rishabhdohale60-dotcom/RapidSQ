# 🚨 RapidSQ — Every Second Matters

**RapidSQ** is an emergency response system designed to reduce the time between an emergency request and professional medical assistance.

The platform connects **public users, hospitals, and ambulance/driver teams** through a simple emergency workflow with location-based hospital discovery, ambulance dispatch, route/ETA information, and emergency notifications.

---

## 🎯 Problem

During medical emergencies, every second matters. Delays can happen because of:

- Difficulty finding the nearest suitable hospital
- Slow ambulance coordination
- Delayed communication between the patient, hospital, and driver
- Lack of real-time emergency status information

RapidSQ aims to bring these steps into one connected workflow.

---

## 💡 Proposed Solution

RapidSQ provides a centralized emergency-response workflow:

**Public User → Emergency Request → Nearest Hospital → Ambulance Dispatch → Hospital Notification → Route & ETA → Emergency Completed**

The system is designed as a prototype for fast and coordinated emergency response.

---

## ✨ Key Features

### 👤 Public User

- Simple user registration
- Emergency contact information
- Optional blood group and allergy information
- Demo OTP verification
- Quick emergency confirmation
- Location-based emergency request
- Nearest hospital identification
- Ambulance route and ETA
- Emergency status tracking

### 🏥 Hospital

- Hospital login using registration details
- Receive emergency notifications
- View ambulance/driver information
- Track emergency request status
- Manage emergency-response information

### 🚑 Ambulance / Driver

- Receive emergency alerts
- View emergency information
- Navigate toward the emergency location
- View hospital destination and route
- Update arrival/completion status

---

## 🔄 Emergency Workflow

```text
┌───────────────┐
│  Public User  │
└───────┬───────┘
        ↓
┌────────────────────┐
│ Emergency Request  │
└────────┬───────────┘
         ↓
┌────────────────────┐
│ Location Detection │
└────────┬───────────┘
         ↓
┌──────────────────────┐
│ Nearest Hospital     │
│ + Ambulance Matching │
└─────────┬────────────┘
          ↓
┌────────────────────────┐
│ Hospital + Driver Alert│
└──────────┬─────────────┘
           ↓
┌────────────────────┐
│ Route + ETA        │
└────────┬───────────┘
         ↓
┌────────────────────┐
│ Patient Reached    │
│ / Emergency Done   │
└────────────────────┘
