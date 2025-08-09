import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Premium() {
  const [formData, setFormData] = useState({
    name: '',
    studentClass: '',
    thought: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [likedSubmissions, setLikedSubmissions] = useState(new Set());
  const [deviceId, setDeviceId] = useState('');

  // Helper: get or create a stable deviceId
  const getOrCreateDeviceId = () => {
    try {
      if (typeof window === 'undefined') return '';
      let id = localStorage.getItem('deviceId');
      if (!id || typeof id !== 'string' || id.length < 8) {
        id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('deviceId', id);
      }
      return id;
    } catch (_) {
      return '';
    }
  };

  useEffect(() => {
    // Ensure a stable deviceId per browser
    try {
      const id = getOrCreateDeviceId();
      if (id) setDeviceId(id);
      // Load liked submissions set from localStorage
      const liked = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('likedSubmissions') || '[]') : [];
      setLikedSubmissions(new Set(liked));
    } catch (e) {
      // ignore storage errors
    }

    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.studentClass || !formData.thought || !selectedImage) {
      return;
    }

    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        const response = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, image: imageData }),
        });

        if (response.ok) {
          setShowSuccess(true);
          setFormData({ name: '', studentClass: '', thought: '' });
          setSelectedImage(null);
          setImagePreview('');
          fetchSubmissions();
          setTimeout(() => setShowSuccess(false), 4000);
        }
        setIsSubmitting(false);
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (submission) => {
    try {
      if (!submission?.id) return;
      const id = submission.id;
      if (likedSubmissions.has(id)) {
        // Already liked on this device
        return;
      }
      // Ensure deviceId exists right now (handles very first click on fresh devices)
      let did = deviceId;
      if (!did || did.length < 8) {
        did = getOrCreateDeviceId();
        setDeviceId(did);
      }
      const resp = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: id, deviceId: did })
      });
      const data = await resp.json();
      if (!resp.ok || data.error) {
        console.error('Like failed:', data.error || resp.statusText);
        return;
      }

      // Update liked set and persist
      const newLiked = new Set(likedSubmissions);
      newLiked.add(id);
      setLikedSubmissions(newLiked);
      try { if (typeof window !== 'undefined') localStorage.setItem('likedSubmissions', JSON.stringify(Array.from(newLiked))); } catch {}

      // Update likes count in submissions list
      if (typeof data.likes === 'number') {
        setSubmissions(prev => prev.map(s => s.id === id ? { ...s, likes: data.likes } : s));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Azadi Ke Kalakar | Independence Day 2025</title>
        <meta name="description" content="A premium platform for students to express their vision of freedom" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={`min-h-screen bg-black text-white overflow-x-hidden ${inter.className}`}>
        {/* Apple-style animated gradient background */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-green-500/20 animate-pulse"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-bounce delay-1000"></div>
        </div>

        {/* Hero Section - Apple Style */}
        <section className="relative z-10 min-h-screen flex flex-col justify-center items-center px-8 py-20">
          <div className="text-center max-w-6xl mx-auto space-y-12">
            {/* Status indicator */}
            <div className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm font-medium text-white/80" style={{fontFamily: 'SF Pro Text'}}>
                Independence Day 2025 • Live Now
              </span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-3"></div>
            </div>

            {/* Main headline - Apple's massive typography style */}
            <div className="space-y-8">
              <h1 className="text-7xl md:text-9xl font-thin tracking-tight text-white leading-none" style={{fontFamily: 'SF Pro Display', fontWeight: 100}}>
                Azadi Ke
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-yellow-400 to-green-400 bg-clip-text text-transparent font-light">
                  Kalakar
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl text-white/60 font-light max-w-4xl mx-auto leading-relaxed" style={{fontFamily: 'SF Pro Text'}}>
                Express your vision of freedom through creativity.
                <br />
                Join young India in celebrating independence.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <button 
                onClick={() => document.getElementById('form-section').scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-12 py-6 bg-white text-black rounded-full text-xl font-medium hover:bg-white/90 transition-all duration-300 transform hover:scale-105"
                style={{fontFamily: 'SF Pro Text'}}
              >
                Share Your Vision
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </section>

        {/* Embedded Video Section */}
        <section className="relative z-10 -mt-6 mb-8 px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              <video
                className="w-full h-auto"
                autoPlay
                muted
                loop
                playsInline
                controls
                preload="metadata"
              >
                <source src="/video/promo1.webm#t=0.1" type="video/webm" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>

        {/* Form Section - Google Material + Apple Glass */}
        <section id="form-section" className="relative z-10 py-32 px-8">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20 space-y-6">
              <h2 className="text-6xl font-thin text-white tracking-tight" style={{fontFamily: 'SF Pro Display'}}>
                Your
                <span className="block text-orange-400 font-light">Story</span>
              </h2>
              <p className="text-xl text-white/60 font-light max-w-2xl mx-auto" style={{fontFamily: 'SF Pro Text'}}>
                Share your thoughts and artwork. Become part of India's creative celebration.
              </p>
            </div>

            {/* Premium Glass Form */}
            <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-12 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Name & Class */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/80 uppercase tracking-widest" style={{fontFamily: 'SF Pro Text'}}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:bg-white/10 focus:border-orange-400/50 focus:outline-none transition-all duration-300"
                      placeholder="Enter your name"
                      style={{fontFamily: 'SF Pro Text'}}
                      required
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white/80 uppercase tracking-widest" style={{fontFamily: 'SF Pro Text'}}>
                      Class
                    </label>
                    <input
                      type="text"
                      name="studentClass"
                      value={formData.studentClass}
                      onChange={handleInputChange}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:bg-white/10 focus:border-orange-400/50 focus:outline-none transition-all duration-300"
                      placeholder="8th, 10th, 12th"
                      style={{fontFamily: 'SF Pro Text'}}
                      required
                    />
                  </div>
                </div>

                {/* Thought */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-white/80 uppercase tracking-widest" style={{fontFamily: 'SF Pro Text'}}>
                      Your Thought on Freedom
                    </label>
                    <span className="text-sm text-white/60 px-3 py-1 bg-white/5 rounded-full">
                      {formData.thought.split(' ').filter(word => word.length > 0).length}/25 words
                    </span>
                  </div>
                  <textarea
                    name="thought"
                    value={formData.thought}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:bg-white/10 focus:border-orange-400/50 focus:outline-none resize-none transition-all duration-300"
                    placeholder="What does freedom mean to you? Share your vision..."
                    style={{fontFamily: 'SF Pro Text'}}
                    required
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-white/80 uppercase tracking-widest" style={{fontFamily: 'SF Pro Text'}}>
                    Upload Artwork
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-orange-500 file:text-white hover:file:bg-orange-600 transition-all duration-300"
                      required
                    />
                  </div>
                  {imagePreview && (
                    <div className="mt-8 text-center">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-w-md max-h-80 mx-auto rounded-2xl shadow-2xl border border-white/20" 
                      />
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-6 px-8 rounded-2xl text-lg shadow-2xl hover:shadow-orange-500/25 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
                    style={{fontFamily: 'SF Pro Text'}}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Publishing...</span>
                      </div>
                    ) : (
                      'Publish Your Vision'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="relative z-10 py-32 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 space-y-8">
              <h2 className="text-6xl font-thin text-white tracking-tight" style={{fontFamily: 'SF Pro Display'}}>
                Gallery of
                <span className="block text-green-400 font-light">Visions</span>
              </h2>
              <p className="text-xl text-white/60 font-light max-w-3xl mx-auto" style={{fontFamily: 'SF Pro Text'}}>
                Discover the creative expressions from students across India
              </p>
              
              <div className="inline-flex items-center space-x-4 px-8 py-4 bg-white/5 backdrop-blur-xl rounded-full border border-white/10">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-white/80">Live Gallery</span>
                <div className="w-px h-5 bg-white/20"></div>
                <span className="text-sm text-white/60">{submissions.length} Visions</span>
              </div>
            </div>

            {submissions.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-32 h-32 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                  <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-light text-white mb-4" style={{fontFamily: 'SF Pro Display'}}>
                  Be the First
                </h3>
                <p className="text-lg text-white/60 font-light">
                  Start the gallery with your vision of freedom
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {submissions.map((submission) => (
                  <div key={submission.id} className="group bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={submission.imageUrl} 
                        alt={`${submission.name}'s artwork`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-xl font-medium text-white mb-1" style={{fontFamily: 'SF Pro Text'}}>
                            {submission.name}
                          </h3>
                          <p className="text-sm text-white/60">Class {submission.studentClass}</p>
                        </div>
                        <button
                          onClick={() => handleLike(submission)}
                          className={`p-3 rounded-2xl transition-all duration-300 ${
                            likedSubmissions.has(submission.id)
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-white/5 text-white/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5" fill={likedSubmissions.has(submission.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-sm text-white/70">{submission.likes || 0}</span>
                          </div>
                        </button>
                      </div>
                      <blockquote className="text-white/80 italic border-l-4 border-orange-400 pl-6" style={{fontFamily: 'SF Pro Text'}}>
                        "{submission.thought}"
                      </blockquote>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-20 px-8 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center space-x-4 mb-8">
              <div className="w-10 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg"></div>
              <div className="w-10 h-7 bg-white/20 border border-white/30 rounded-lg"></div>
              <div className="w-10 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-lg"></div>
            </div>
            
            <h3 className="text-3xl font-light text-white" style={{fontFamily: 'SF Pro Display'}}>
              Independence Day 2025
            </h3>
            <p className="text-lg text-white/60 italic">"Education is True Freedom"</p>
            
            <div className="pt-8 border-t border-white/10">
              <p className="text-white/40 text-sm">Powered by Shiksha Ke Sipahi Initiative</p>
            </div>
          </div>
        </footer>

        {/* Success Toast */}
        {showSuccess && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-8 py-4 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Vision Published</p>
                  <p className="text-sm text-white/60">Added to the gallery</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
