# 🌟 आज़ादी के कलाकार - Azadi Ke Kalakar

An interactive Independence Day student activity web application where students can share their thoughts and artwork about freedom in India.

## 🎯 Features

- **Single Page Application**: Complete experience on one page with form, gallery, and interactive elements
- **Student Submissions**: Students can submit their name, class, thought (max 25 words), and an image
- **Live Gallery**: Auto-refreshing gallery showing all submissions with like functionality
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops
- **Independence Day Theme**: Beautiful tricolor design with animations and festive elements
- **Real-time Updates**: Gallery refreshes every 5 seconds to show new submissions
- **Image Upload**: Supports all image formats with preview functionality

## 🚀 Quick Deploy to Vercel

1. **Install Dependencies**:
   ```bash
   cd /home/surya/Documents/siksha_students
   npm install
   ```

2. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Choose "Link to existing project?" → No
   - Project name: `azadi-ke-kalakar` (or your preferred name)
   - Directory: `./` (current directory)
   - Build settings: Use default (Next.js detected automatically)

4. **Set up Blob Storage**:
   - After deployment, go to your Vercel dashboard
   - Navigate to your project → Settings → Environment Variables
   - Add: `BLOB_READ_WRITE_TOKEN` (Vercel will auto-generate this for Blob storage)

5. **Your app is live!** 🎉

## 🎨 Theme Details

**"आज़ादी के कलाकार: मेरी सोच, मेरी तस्वीर"**
- Students express their vision for free India through creative submissions
- Combines text (thoughts) and visual (artwork/photos) elements
- Celebrates young India's perspective on independence and freedom

## 📱 How Students Use It

1. **Fill the Form**:
   - Enter name and class
   - Write their thought on freedom (max 25 words)
   - Upload an image (drawing, photo, digital art)

2. **Submit & Celebrate**: One-click submission with success animation

3. **View Gallery**: See all submissions in a beautiful grid layout

4. **Interact**: Like other students' submissions

## 🛠️ Technical Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Storage**: Vercel Blob Storage for images
- **Deployment**: Vercel (one-click deploy)

## 🎯 Perfect For

- Schools celebrating Independence Day
- Student engagement activities
- Creative expression platforms
- Community art showcases
- Educational institutions

## 📞 Support

The application is ready to deploy and share with schools. Simply run the deployment commands and share the live URL with students and teachers!

---

**Made with ❤️ for Young India | Powered by Shiksha Ke Sipahi Initiative**
