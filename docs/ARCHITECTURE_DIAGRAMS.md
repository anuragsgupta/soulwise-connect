# System Architecture Diagram

## Before: Error-Prone Setup

```
┌─────────────────────────────────────────────────────────┐
│                    USER                                 │
│              Sends Chat Message                         │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │ Browser/Client  │
        └────────┬────────┘
                 │
        ┌────────▼─────────────────┐
        │ /api/chatbot             │
        │ ❌ Invalid AWS Creds     │
        └────────┬─────────────────┘
                 │
        ┌────────▼──────────┐
        │ Initialize Client │
        │ ❌ CRASH!         │
        └───────────────────┘
                 │
        ┌────────▼────────────┐
        │ 500 Server Error ❌ │
        └─────────────────────┘
                 │
                 ▼
        User sees ERROR PAGE ❌
```

## After: Graceful & Resilient Setup

```
┌──────────────────────────────────────────────────────────────┐
│                       USER                                   │
│                 Settings UI ⚙️                              │
│            Store Gemini API Key                             │
└────────┬───────────────────────────────────────────┬────────┘
         │                                           │
    ┌────▼────────┐                         ┌────────▼─────┐
    │ IndexedDB   │                         │ Environment  │
    │ (Browser)   │                         │ Variables    │
    │ API Key ✅  │                         │ API Key ⚠️   │
    └────┬────────┘                         └────────┬─────┘
         │                                           │
         └──────────────────┬──────────────────────┘
                            │
                   ┌────────▼──────────┐
                   │ sendChatbotMessage│
                   │ (Client Utility)  │
                   └────────┬──────────┘
                            │
               ┌────────────┴─────────────┐
               │ GET KEY FROM IndexedDB  │
               │ (Priority 1)            │
               └────────────┬─────────────┘
                            │
               ┌────────────▼──────────┐
               │ Send Request with    │
               │ x-gemini-api-key     │
               │ Header ✅            │
               └────────────┬──────────┘
                            │
                   ┌────────▼─────────────┐
                   │ /api/chatbot Route   │
                   │                      │
                   │ 1. Check Header ✅   │
                   │ 2. Check Env ✅      │
                   │ 3. Use Found Key ✅  │
                   └────────────┬─────────┘
                            │
                   ┌────────▼────────────┐
                   │ Call Gemini API ✅  │
                   └────────────┬────────┘
                            │
                   ┌────────▼──────────┐
                   │ Get Response ✅   │
                   └────────────┬──────┘
                            │
                   ┌────────▼──────────────┐
                   │ Try Save to DynamoDB │
                   │ (Non-Blocking) ⚠️    │
                   │                      │
                   │ ├─ Success? → Log ✅ │
                   │ ├─ Fail? → Log ⚠️    │
                   │ └─ Continue Anyway   │
                   └────────────┬─────────┘
                            │
                   ┌────────▼──────────┐
                   │ Return Response  │
                   │ Status: 200 ✅   │
                   └────────────┬──────┘
                            │
                            ▼
                ✅ User Sees Response!
                ✅ Chat Works!
                ✅ History Saved (if DDB works)
                ✅ Crisis Alerts Still Sent
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Settings Components                    │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  SettingsModal.tsx                          │ │  │
│  │  │  ├─ API Keys Tab                            │ │  │
│  │  │  │  └─ ApiKeySettings.tsx                   │ │  │
│  │  │  │     ├─ Input field                       │ │  │
│  │  │  │     ├─ Show/Hide button                  │ │  │
│  │  │  │     └─ Save/Delete buttons               │ │  │
│  │  │  └─ Profile Tab (coming soon)               │ │  │
│  │  │  └─ Privacy Tab (coming soon)               │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                       │                                │
│                       │ Uses                           │
│                       ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Storage Layer                          │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  apiKeyStore.ts                             │ │  │
│  │  │  ├─ initializeApiKeyDB()                    │ │  │
│  │  │  ├─ saveGeminiApiKey()                      │ │  │
│  │  │  ├─ getGeminiApiKey() ← Chatbot uses this  │ │  │
│  │  │  ├─ deleteGeminiApiKey()                    │ │  │
│  │  │  └─ hasGeminiApiKey()                       │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  IndexedDB (Browser Storage)                │ │  │
│  │  │  ├─ Database: SoulwiseConnect              │ │  │
│  │  │  └─ Store: apiKeys                         │ │  │
│  │  │     └─ Data: { geminiApiKey, lastUpdated } │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       │ HTTP Request
                       │ + x-gemini-api-key Header
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   Server Layer                          │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │        API Routes                               │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  /api/chatbot (POST)                        │ │  │
│  │  │  ├─ Extract apiKey from header              │ │  │
│  │  │  ├─ Fallback to NEXT_PUBLIC_GEMINI_API_KEY │ │  │
│  │  │  ├─ Call Gemini API                         │ │  │
│  │  │  ├─ Try save to DynamoDB                    │ │  │
│  │  │  └─ Return 200 success always               │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  /api/chat-memory (POST)                    │ │  │
│  │  │  ├─ Accept message data                     │ │  │
│  │  │  ├─ Try save to DynamoDB                    │ │  │
│  │  │  │  └─ If fail: return 200 with warning    │ │  │
│  │  │  └─ Return 200 success always               │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                       │                                │
│                       │ Uses                           │
│                       ▼                                │
│  ┌──────────────────────────────────────────────────┐  │
│  │        Service Layer                            │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  chatMemory.ts (DynamoDB)                   │ │  │
│  │  │  ├─ getDocClient() ← New!                   │ │  │
│  │  │  │  └─ Lazy init with credential check     │ │  │
│  │  │  ├─ saveChatMessage()                       │ │  │
│  │  │  │  └─ Returns early if client null        │ │  │
│  │  │  ├─ getChatHistory()                        │ │  │
│  │  │  │  └─ Returns [] if client null           │ │  │
│  │  │  ├─ getSentimentTrend()                     │ │  │
│  │  │  └─ deleteChatHistory()                     │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                       │                                │
│        ┌──────────────┴───────────────────┐            │
│        │ Uses                            │ Uses        │
│        ▼                                 ▼            │
│  ┌──────────────┐              ┌──────────────────┐   │
│  │ Gemini API   │              │ AWS DynamoDB     │   │
│  │ ✅ Required  │              │ ⚠️ Optional      │   │
│  │              │              │                  │   │
│  │ gemini-2.5   │              │ Chat Memory      │   │
│  │ -flash       │              │ (Can fail)       │   │
│  └──────────────┘              └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Error Recovery Flow

```
┌─────────────────────────────────────────────────────┐
│        Chatbot Request Processing                   │
└────────────────┬────────────────────────────────────┘
                 │
    ┌────────────▼────────────┐
    │ Get Gemini API Key      │
    └────┬────────────────┬───┘
         │ Found?         │
    ┌────▼──────┐  ┌──────▼──────┐
    │ YES ✅    │  │ NO ⚠️        │
    └────┬──────┘  └──────┬──────┘
         │                │
         │         Return Error ❌
         │         "API key not configured"
         │
    ┌────▼────────────────┐
    │ Call Gemini API      │
    └────┬────────────────┬┘
         │ Success?       │
    ┌────▼──────┐  ┌──────▼──────┐
    │ YES ✅    │  │ NO ⚠️        │
    └────┬──────┘  │ (429, 500)   │
         │         │              │
         │         └──┐           │
         │            │ Return    │
         │            │ Fallback  │
         │            │ Response  │
         │            │           │
    ┌────▼────────────────────────┐
    │ Try Save to DynamoDB        │
    │ (Non-Blocking) ⚠️            │
    └────┬────────────────────┬───┘
         │ Success?           │
    ┌────▼────────┐  ┌────────▼────┐
    │ YES ✅      │  │ NO ⚠️        │
    │ Log Success │  │ Log Warning  │
    │ Continue ✅ │  │ Continue ✅  │
    └────┬────────┘  └────────┬─────┘
         │                    │
         └────────┬───────────┘
                  │
         ┌────────▼───────────┐
         │ Return 200 Status  │
         │ ✅ Always Success! │
         └────────┬───────────┘
                  │
                  ▼
         User Sees Response ✅
```

## Key Metrics

```
System Resilience Matrix:

                  DynamoDB   Gemini API
Normal Case:        ✅          ✅    → User sees response + saved
Gemini Down:        ✅          ❌    → Fallback response
DynamoDB Down:      ❌          ✅    → Response shown + warning
Both Down:          ❌          ❌    → Error (but graceful)
No API Key:         ❌          ❌    → Error with helpful hint

Crisis Detection:   Always Works Regardless! 🚨
├─ Detects crisis keywords → ✅
├─ Sends SMS alert → ✅ (independent)
├─ Generates response → ✅ (independent)
└─ User gets help immediately → ✅
```

---

This diagram shows how the new system is significantly more resilient than before!
