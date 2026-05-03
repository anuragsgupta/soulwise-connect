# 🎯 Quick Test Accounts Reference

## 🔑 All Passwords: `12345678`

---

## 👨‍💼 Super Admin
```
Email: superadmin@mannmitra.com
Password: SuperAdmin@2024
```

---

## 🏛️ IIT Delhi - Computer Science (CSE)

### 👨‍🏫 Faculty
| Email | Role |
|-------|------|
| `prof.amit.sharma.cse@iitd.ac.in` | HOD |
| `dr.priya.patel.cse@iitd.ac.in` | Faculty |
| `dr.rajesh.kumar.cse@iitd.ac.in` | Faculty |
| `ms.sneha.singh.cse@iitd.ac.in` | Counselor |
| `mr.vikram.reddy.cse@iitd.ac.in` | Mentor |

### 👨‍🎓 Students
| Email |
|-------|
| `aarav.kumar.cse@student.iitd.ac.in` |
| `vivaan.sharma.cse@student.iitd.ac.in` |
| `aditya.patel.cse@student.iitd.ac.in` |
| `arjun.singh.cse@student.iitd.ac.in` |
| `sai.reddy.cse@student.iitd.ac.in` |

---

## 🏛️ University of Mumbai - Business (MBA)

### 👨‍🏫 Faculty
| Email | Role |
|-------|------|
| `prof.anjali.verma.mba@mu.ac.in` | HOD |
| `dr.suresh.gupta.mba@mu.ac.in` | Faculty |
| `dr.kavita.krishnan.mba@mu.ac.in` | Faculty |
| `ms.arjun.rao.mba@mu.ac.in` | Counselor |
| `mr.meera.mehta.mba@mu.ac.in` | Mentor |

### 👨‍🎓 Students
| Email |
|-------|
| `aarav.kumar.mba@student.mu.ac.in` |
| `vivaan.sharma.mba@student.mu.ac.in` |
| `diya.nair.mba@student.mu.ac.in` |

---

## 🏛️ Anna University - Electronics (ECE)

### 👨‍🏫 Faculty
| Email | Role |
|-------|------|
| `prof.priya.patel.ece@annauniv.edu` | HOD |
| `dr.rajesh.kumar.ece@annauniv.edu` | Faculty |

### 👨‍🎓 Students
| Email |
|-------|
| `aarav.kumar.ece@student.annauniv.edu` |
| `ananya.iyer.ece@student.annauniv.edu` |

---

## 📝 Email Format Guide

### Faculty
```
{firstname}.{lastname}.{dept}@{university}

Examples:
amit.sharma.cse@iitd.ac.in
priya.patel.mba@mu.ac.in
```

### Students
```
{firstname}.{lastname}.{dept}@student.{university}

Examples:
aarav.kumar.cse@student.iitd.ac.in
diya.reddy.mba@student.mu.ac.in
```

---

## 🎓 Available Departments

| Code | Name |
|------|------|
| CSE | Computer Science and Engineering |
| ECE | Electronics and Communication |
| MBA | Business Administration |
| SCI | Applied Sciences |
| HSS | Humanities and Social Sciences |

---

## 🏫 Available Universities

| Domain | Name |
|--------|------|
| iitd.ac.in | IIT Delhi |
| mu.ac.in | University of Mumbai |
| annauniv.edu | Anna University |
| jnu.ac.in | JNU |
| caluniv.ac.in | University of Calcutta |

---

## 🚀 Quick Start

1. **Run Seed:**
   ```bash
   ./seed-database.sh
   # or
   npx tsx prisma/seed-full.ts
   ```

2. **Start App:**
   ```bash
   npm run dev
   ```

3. **View Data:**
   ```bash
   npx prisma studio
   ```

4. **Login:**
   - Go to http://localhost:3000/login
   - Use any email above
   - Password: `12345678`

---

## 📊 Data Summary

- 5 Universities
- 25 Institutes (5 per university)
- 125 Faculty (5 per institute)
- 250 Students (10 per institute)
- **Total: 376 test accounts**

---

**Remember:** All user passwords are `12345678`
