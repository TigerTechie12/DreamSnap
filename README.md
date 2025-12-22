🎨 DreamSnap

AI Image Generation Platform

🌌 What is DreamSnap?

DreamSnap is a full-stack AI image generation platform where users can train their own AI models and generate images or curated image packs using custom prompts.

Powered by fal.ai, DreamSnap allows creators to go beyond generic image generation by fine-tuning models on their own datasets and using them to produce consistent, high-quality visuals.

✨ Key Features
🧠 AI & Model Training (fal.ai)

Train custom AI image models using fal.ai

Generate images using trained or default models

Model-specific prompt generation

Reuse trained models across multiple image packs

🖼️ Image & Pack Management

Generate AI images from text prompts

Organize images into packs

Full CRUD support for images and packs

🔐 Platform Features

Secure authentication via Clerk

User-scoped access control

Cloud-based image storage with AWS S3

Type-safe backend with Prisma & TypeScript

🧠 Tech Stack
Frontend

React

REST-based API integration

Backend

Node.js

Express.js

TypeScript

PostgreSQL

Prisma ORM

AI & Model Training

fal.ai

Custom model training

Image generation inference

Authentication

Clerk

Storage

AWS S3

🏗️ System Architecture
Client (React)
   |
   | REST APIs
   ↓
Server (Express + TypeScript)
   |
   | Prisma ORM
   ↓
PostgreSQL

AI Training & Inference → fal.ai
Image Storage → AWS S3
Auth → Clerk

🚀 Getting Started
Prerequisites

Node.js (v18+)

PostgreSQL

AWS S3 bucket

Clerk account

fal.ai API key

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

Create a .env file in the backend directory:

DATABASE_URL=postgresql://user:password@localhost:5432/dreamsnap

CLERK_SECRET_KEY=your_clerk_secret
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

FAL_API_KEY=your_fal_api_key

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET_NAME=your_bucket_name

4️⃣ Database Setup
npx prisma migrate dev
npx prisma generate

5️⃣ Run the Application

Backend

npm run dev


Frontend

npm start

📡 API Overview
🧠 Models (fal.ai)
Method	Endpoint	Description
POST	/models/train	Train a new custom model
GET	/models	List user-trained models
DELETE	/models/:id	Delete a trained model
🖼️ Images
Method	Endpoint	Description
POST	/images	Generate image using selected model
GET	/images	Fetch user images
PUT	/images/:id	Update image metadata
DELETE	/images/:id	Delete image
📦 Packs
Method	Endpoint	Description
POST	/packs	Create image pack
POST	/packs/:id/generate	Generate images inside a pack
GET	/packs	Fetch all packs
PUT	/packs/:id	Update pack
DELETE	/packs/:id	Delete pack
🔮 Roadmap

🧬 Model versioning & retraining

📊 Training progress tracking

🌍 Public & shared models

💳 Credit-based pricing per training & inference

🖌️ Image editing & variations

⚡ Real-time generation updates

🤝 Contributing

Contributions are welcome!

Fork the repo

Create a new branch

Commit your changes

Open a pull request 🚀

📄 License

This project is licensed under the MIT License.

💡 Vision

DreamSnap is built to empower creators with custom-trained AI models, not just generic image generation — blending creativity, control, and scalable engineering into one platform.
