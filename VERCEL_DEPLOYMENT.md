# Complete Vercel Deployment Guide

## 🔧 Step 1: MongoDB Atlas Setup

### Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new cluster (choose free tier)
4. Wait for cluster to be created (2-3 minutes)

### Configure Database Access
1. **Database Access** → **Add New Database User**
   - Username: `your_username`
   - Password: `generate_secure_password`
   - Database User Privileges: **Read and write to any database**

2. **Network Access** → **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add your specific IP addresses

### Get Connection String
1. Go to **Clusters** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
4. Replace `<username>`, `<password>`, and `<dbname>` with your values

## 🚀 Step 2: Vercel Deployment

### Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/social-media-app.git
git push -u origin main
```

### Deploy on Vercel
1. Go to [Vercel](https://vercel.com)
2. Sign up/Login with GitHub
3. Click **New Project**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

## 🔐 Step 3: Environment Variables

### In Vercel Dashboard
Go to **Project Settings** → **Environment Variables** and add:

```env
# MongoDB Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/social_media?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_SECRET=your_super_secret_key_here_32_characters_minimum
NEXTAUTH_URL=https://your-app-name.vercel.app

# ImageKit Configuration
NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Or use: https://generate-secret.vercel.app/32

## 📱 Step 4: ImageKit Setup

### Create ImageKit Account
1. Go to [ImageKit](https://imagekit.io)
2. Sign up for free account
3. Go to **Developer** → **API Keys**
4. Copy:
   - **Public Key**
   - **Private Key** 
   - **URL Endpoint**

### Configure ImageKit
1. **Media Library** → **Settings**
2. Enable **Upload** permissions
3. Set **Upload Directory**: `/videos` and `/images`
4. Configure **Transformation** settings as needed

## 🔄 Step 5: Domain & SSL

### Custom Domain (Optional)
1. **Project Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate is automatically provisioned

## 🧪 Step 6: Testing

### Test Your Deployment
1. Visit your Vercel URL
2. Test user registration
3. Test video upload
4. Test social features (likes, comments)
5. Test mobile responsiveness

### Monitor Deployment
- **Functions** tab: Monitor API performance
- **Analytics** tab: Track usage
- **Logs** tab: Debug issues

## 🔧 Step 7: Database Initialization

### First Time Setup
Your MongoDB collections will be created automatically when:
1. First user registers
2. First video is uploaded
3. First comment is made

### Collections Created
- `users` - User accounts
- `videos` - Video posts with metadata
- Indexes are automatically created for performance

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
npm run build
```

**Database Connection Issues**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

**ImageKit Upload Issues**
- Verify API keys are correct
- Check upload permissions in ImageKit dashboard
- Ensure file size limits are appropriate

**Authentication Issues**
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure MongoDB connection for user storage

### Environment Variables Checklist
- [ ] MONGODB_URI (with correct username/password)
- [ ] NEXTAUTH_SECRET (32+ characters)
- [ ] NEXTAUTH_URL (your Vercel domain)
- [ ] NEXT_PUBLIC_PUBLIC_KEY (ImageKit)
- [ ] IMAGEKIT_PRIVATE_KEY (ImageKit)
- [ ] NEXT_PUBLIC_URL_ENDPOINT (ImageKit)

## 📊 Performance Optimization

### Vercel Settings
- **Functions**: Automatically optimized
- **Edge Functions**: Consider for global performance
- **Analytics**: Monitor Core Web Vitals
- **Speed Insights**: Track performance metrics

### MongoDB Optimization
- Use connection pooling (already configured)
- Create indexes for frequently queried fields
- Monitor query performance in Atlas

## 🔄 Continuous Deployment

Every push to `main` branch will automatically:
1. Trigger new deployment
2. Run build process
3. Deploy to production
4. Update live site

Your social media app is now ready for production! 🎉
