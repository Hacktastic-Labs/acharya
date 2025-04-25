# Acharya AI 🧠📚  
An AI-powered platform revolutionizing interactive learning with intelligent flashcards, podcasts, and smart summarizations.

---

## 🌟 Overview  
**Acharya** transforms traditional educational material into engaging, interactive experiences. From dynamic flashcards to audio-based conversations and intelligent summaries, it redefines how students absorb and retain knowledge.

---

## ✨ Key Features  
- ⚡ **Dynamic Content Conversion** – Convert documents into interactive flashcards  
- 🎙️ **AI Podcast Generator** – Transform content into natural-sounding audio using Deepgram  
- 🧾 **Smart Summarizations** – Condense lengthy material into digestible summaries  
- 🔐 **Secure Document Management** – Upload and manage learning materials safely  
- 🧠 **AI-Adaptive Learning** – Personalized learning paths through usage analytics  
- 🎨 **Minimalist UI/UX** – Clean, responsive design with light/dark mode  
- 🌍 **Cross-Platform Compatibility** – Seamless experience across devices  
- 🛡️ **Clerk Authentication** – Secure user accounts with authentication  

---

## 🛠️ Tech Stack  

**Frontend**  
- Next.js  
- React  
- TypeScript  
- Tailwind CSS  

**Backend**  
- PostgreSQL (via Prisma ORM)  
- Clerk (Authentication)  
- Deepgram AI (for speech synthesis)  
- OpenAI / custom ML (for summarization + learning adaptation)  

---

## 🚀 Getting Started  

### 1. Clone the repository  
```bash
git clone https://github.com/your-username/acharya-ai.git
cd acharya-ai
```

### 2. Install dependencies  
```bash
npm install
```

### 3. Configure environment variables  
Create a `.env.local` file with the following:  
```ini
DATABASE_URL=postgresql://user:password@localhost:5432/acharya
CLERK_SECRET_KEY=your_clerk_secret
NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api
DEEPGRAM_API_KEY=your_deepgram_api_key
GEMINI_API_KEY=your_openai_key
```

### 4. Set up the database  
```bash
npx prisma migrate dev --name init
```

### 5. Run the development server  
```bash
npm run dev
```

## 🤝 Team Hacktastic  
Built with 💙 by:  
- Pushkar Aggarwal  
- Pranay Sharma  

We’d love your thoughts and contributions:  
- Report bugs or issues  
- Propose new ideas  
- Fork & open pull requests  

---

## 📝 License  
This project is licensed under the [MIT License](LICENSE).

---

## 🔗 Links  
- [GitHub Repository](https://github.com/sharmapranay38/acharya)  
- Live Demo *(if available)*  
- Built with ❤️ by **Team Hacktastic** at **Hackaccino 3.0**
```
