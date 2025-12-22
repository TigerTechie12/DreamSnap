🎨 DreamSnap

AI Image Generation Platform

🌌 What is DreamSnap?

DreamSnap is an AI-powered image generation platform that transforms text prompts into stunning visuals.
Users can generate images, organize them into packs, and fully manage their creations — all within a secure, scalable, and modern full-stack application.

Built with performance, extensibility, and developer experience in mind.

✨ Key Features

🧠 Prompt-based AI Image Generation

🖼️ Image Packs

Group generated images into collections

✏️ CRUD Operations

Create, update, and delete images & packs

🔐 Authentication & Authorization

Powered by Clerk

☁️ Cloud Image Storage

Secure, scalable uploads using AWS S3

🧩 User-Scoped Data

Each user accesses only their own content

⚡ Type-Safe Backend

Prisma + TypeScript for reliability

🧠 Tech Stack
Frontend

React

REST API integration

Component-driven UI

Backend

Node.js

Express.js

TypeScript

PostgreSQL

Prisma ORM

Authentication

Clerk

Storage

AWS S3

🏗️ System Architecture
Client (React)
   |
   | REST API
   ↓
Server (Express + TypeScript)
   |
   | Prisma ORM
   ↓
PostgreSQL

Images → AWS S3
Auth → Clerk

🚀 Getting Started
Prerequisites

Node.js (v18+)

PostgreSQL

AWS S3 bucket

Clerk account

1️⃣ Clone the Repository
git clone https://github.com/your-username/dreamsnap.git
cd dreamsnap

2️⃣ Install Dependencies

Frontend

cd frontend
npm install


Backend

cd backend
npm install

3️⃣ Environment Variables

Create a .env file inside the backend directory:

DATABASE_URL=postgresql://user:password@localhost:5432/dreamsnap

CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name

4️⃣ Database Setup
npx prisma migrate dev
npx prisma generate

5️⃣ Run the App

Backend

npm run dev


Frontend

npm start

📡 API Overview
🔐 Auth

Authentication handled via Clerk middleware

🖼️ Images
Method	Endpoint	Description
POST	/images	Generate & save a new image
GET	/images	Get all user images
PUT	/images/:id	Update image metadata
DELETE	/images/:id	Delete image
📦 Packs
Method	Endpoint	Description
POST	/packs	Create a new image pack
GET	/packs	Get all packs
PUT	/packs/:id	Update a pack
DELETE	/packs/:id	Delete a pack
🔮 Future Roadmap

🧾 Prompt history & regeneration

🌍 Public packs & sharing

💳 Credit-based usage system

🖌️ Image editing & upscaling

⚡ Streaming generation status

🧠 Model switching (SD / DALL·E / Custom)

🤝 Contributing

Contributions are welcome!

Fork the repository

Create a feature branch

Commit your changes

Open a pull request 🚀

📄 License

Licensed under the MIT License.

💡 Vision

DreamSnap aims to be a creative AI playground — blending powerful AI image generation with robust backend engineering and delightful UX.
