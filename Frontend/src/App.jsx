import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ref, listAll, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const PHOTOS_PER_PAGE = 6
const IS_DEV = import.meta.env.DEV

function App() {
  const [allPhotos, setAllPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PHOTOS_PER_PAGE)
  const [columnsCount, setColumnsCount] = useState(3)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const loaderRef = useRef(null)

  // Fetch photos based on environment
  useEffect(() => {
    const fetchPhotos = async () => {
      if (IS_DEV) {
        // --- LOCAL DEVELOPMENT MODE ---
        // Local path: /public/dev_photos/ (You should place your test photos here)
        const localPhotos = [
          { name: 'samplePhoto44.jpg', url: '/dev_photos/samplePhoto44.jpg' },
          { name: 'samplePhoto68.jpg', url: '/dev_photos/samplePhoto68.jpg' },
          { name: 'samplePhoto76.jpg', url: '/dev_photos/samplePhoto76.jpg' },
          { name: 'samplePhoto81.jpg', url: '/dev_photos/samplePhoto81.jpg' },
          { name: 'samplePhoto72.jpg', url: '/dev_photos/samplePhoto72.jpg' },
          { name: 'samplePhoto80.jpg', url: '/dev_photos/samplePhoto80.jpg' },
          { name: 'samplePhoto78.jpg', url: '/dev_photos/samplePhoto78.jpg' },
          { name: 'samplePhoto17.jpg', url: '/dev_photos/samplePhoto17.jpg' },
          { name: 'samplePhoto3.jpg', url: '/dev_photos/samplePhoto3.jpg' },
          { name: 'samplePhoto52.jpg', url: '/dev_photos/samplePhoto52.jpg' },
          { name: 'samplePhoto43.jpg', url: '/dev_photos/samplePhoto43.jpg' },
          { name: 'samplePhoto11.jpg', url: '/dev_photos/samplePhoto11.jpg' },
          { name: 'samplePhoto7.jpg', url: '/dev_photos/samplePhoto7.jpg' },
          { name: 'samplePhoto59.jpg', url: '/dev_photos/samplePhoto59.jpg' },
          { name: 'samplePhoto48.jpg', url: '/dev_photos/samplePhoto48.jpg' },
          { name: 'samplePhoto51.jpg', url: '/dev_photos/samplePhoto51.jpg' },
          { name: 'samplePhoto57.jpg', url: '/dev_photos/samplePhoto57.jpg' },
          { name: 'samplePhoto41.jpg', url: '/dev_photos/samplePhoto41.jpg' },
          { name: 'samplePhoto37.jpg', url: '/dev_photos/samplePhoto37.jpg' },
          { name: 'samplePhoto38.jpg', url: '/dev_photos/samplePhoto38.jpg' },
          { name: 'samplePhoto36.jpg', url: '/dev_photos/samplePhoto36.jpg' },
          { name: 'samplePhoto33.jpg', url: '/dev_photos/samplePhoto33.jpg' },
          { name: 'samplePhoto31.jpg', url: '/dev_photos/samplePhoto31.jpg' },
          { name: 'samplePhoto32.jpg', url: '/dev_photos/samplePhoto32.jpg' },
          { name: 'samplePhoto28.jpg', url: '/dev_photos/samplePhoto28.jpg' },
          { name: 'samplePhoto24.jpg', url: '/dev_photos/samplePhoto24.jpg' },
          { name: 'samplePhoto21.jpg', url: '/dev_photos/samplePhoto21.jpg' },
          { name: 'samplePhoto1.jpg', url: '/dev_photos/samplePhoto1.jpg' },
          { name: 'samplePhoto2.jpg', url: '/dev_photos/samplePhoto2.jpg' },
          { name: 'samplePhoto4.jpg', url: '/dev_photos/samplePhoto4.jpg' },
          { name: 'samplePhoto5.jpg', url: '/dev_photos/samplePhoto5.jpg' },
          { name: 'samplePhoto6.jpg', url: '/dev_photos/samplePhoto6.jpg' },
          { name: 'samplePhoto8.jpg', url: '/dev_photos/samplePhoto8.jpg' },
          { name: 'samplePhoto9.jpg', url: '/dev_photos/samplePhoto9.jpg' },
          { name: 'samplePhoto10.jpg', url: '/dev_photos/samplePhoto10.jpg' },
          { name: 'samplePhoto12.jpg', url: '/dev_photos/samplePhoto12.jpg' },
          { name: 'samplePhoto13.jpg', url: '/dev_photos/samplePhoto13.jpg' },
          { name: 'samplePhoto14.jpg', url: '/dev_photos/samplePhoto14.jpg' },
          { name: 'samplePhoto15.jpg', url: '/dev_photos/samplePhoto15.jpg' },
          { name: 'samplePhoto16.jpg', url: '/dev_photos/samplePhoto16.jpg' },
          { name: 'samplePhoto18.jpg', url: '/dev_photos/samplePhoto18.jpg' },
          { name: 'samplePhoto19.jpg', url: '/dev_photos/samplePhoto19.jpg' },
          { name: 'samplePhoto20.jpg', url: '/dev_photos/samplePhoto20.jpg' },
          { name: 'samplePhoto22.jpg', url: '/dev_photos/samplePhoto22.jpg' },
          { name: 'samplePhoto23.jpg', url: '/dev_photos/samplePhoto23.jpg' },
          { name: 'samplePhoto25.jpg', url: '/dev_photos/samplePhoto25.jpg' },
          { name: 'samplePhoto26.jpg', url: '/dev_photos/samplePhoto26.jpg' },
          { name: 'samplePhoto27.jpg', url: '/dev_photos/samplePhoto27.jpg' },
          { name: 'samplePhoto29.jpg', url: '/dev_photos/samplePhoto29.jpg' },
          { name: 'samplePhoto30.jpg', url: '/dev_photos/samplePhoto30.jpg' },
          { name: 'samplePhoto34.jpg', url: '/dev_photos/samplePhoto34.jpg' },
          { name: 'samplePhoto35.jpg', url: '/dev_photos/samplePhoto35.jpg' },
          { name: 'samplePhoto39.jpg', url: '/dev_photos/samplePhoto39.jpg' },
          { name: 'samplePhoto40.jpg', url: '/dev_photos/samplePhoto40.jpg' },
          { name: 'samplePhoto42.jpg', url: '/dev_photos/samplePhoto42.jpg' },
          { name: 'samplePhoto45.jpg', url: '/dev_photos/samplePhoto45.jpg' },
          { name: 'samplePhoto46.jpg', url: '/dev_photos/samplePhoto46.jpg' },
          { name: 'samplePhoto47.jpg', url: '/dev_photos/samplePhoto47.jpg' },
          { name: 'samplePhoto48.jpg', url: '/dev_photos/samplePhoto48.jpg' },
          { name: 'samplePhoto49.jpg', url: '/dev_photos/samplePhoto49.jpg' },
          { name: 'samplePhoto50.jpg', url: '/dev_photos/samplePhoto50.jpg' },
          { name: 'samplePhoto53.jpg', url: '/dev_photos/samplePhoto53.jpg' },
          { name: 'samplePhoto54.jpg', url: '/dev_photos/samplePhoto54.jpg' },
          { name: 'samplePhoto55.jpg', url: '/dev_photos/samplePhoto55.jpg' },
          { name: 'samplePhoto56.jpg', url: '/dev_photos/samplePhoto56.jpg' },
          { name: 'samplePhoto58.jpg', url: '/dev_photos/samplePhoto58.jpg' },
          { name: 'samplePhoto60.jpg', url: '/dev_photos/samplePhoto60.jpg' },
          { name: 'samplePhoto61.jpg', url: '/dev_photos/samplePhoto61.jpg' },
          { name: 'samplePhoto62.jpg', url: '/dev_photos/samplePhoto62.jpg' },
          { name: 'samplePhoto63.jpg', url: '/dev_photos/samplePhoto63.jpg' },
          { name: 'samplePhoto64.jpg', url: '/dev_photos/samplePhoto64.jpg' },
          { name: 'samplePhoto65.jpg', url: '/dev_photos/samplePhoto65.jpg' },
          { name: 'samplePhoto66.jpg', url: '/dev_photos/samplePhoto66.jpg' },
          { name: 'samplePhoto67.jpg', url: '/dev_photos/samplePhoto67.jpg' },
          { name: 'samplePhoto69.jpg', url: '/dev_photos/samplePhoto69.jpg' },
          { name: 'samplePhoto70.jpg', url: '/dev_photos/samplePhoto70.jpg' },
          { name: 'samplePhoto71.jpg', url: '/dev_photos/samplePhoto71.jpg' },
          { name: 'samplePhoto73.jpg', url: '/dev_photos/samplePhoto73.jpg' },
          { name: 'samplePhoto74.jpg', url: '/dev_photos/samplePhoto74.jpg' },
          { name: 'samplePhoto75.jpg', url: '/dev_photos/samplePhoto75.jpg' },
          { name: 'samplePhoto77.jpg', url: '/dev_photos/samplePhoto77.jpg' },
          { name: 'samplePhoto79.jpg', url: '/dev_photos/samplePhoto79.jpg' },
          { name: 'banner.jpg', url: '/dev_photos/banner.jpg' },
          { name: 'profilePhoto.jpg', url: '/dev_photos/profilePhoto.jpg' },
        ]
        setAllPhotos(localPhotos)
        setLoading(false)
      } else {
        // --- PRODUCTION MODE (FIREBASE STORAGE) ---
        try {
          const storageRef = ref(storage, '') 
          const result = await listAll(storageRef)
          
          const urlPromises = result.items.map(async (item) => {
            const url = await getDownloadURL(item)
            return { name: item.name, url: url }
          })

          const photoData = await Promise.all(urlPromises)
          photoData.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
          
          setAllPhotos(photoData)
        } catch (error) {
          console.error("Error fetching photos from Firebase Storage:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchPhotos()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setColumnsCount(2)
      } else if (window.innerWidth <= 1024) {
        setColumnsCount(2)
      } else {
        setColumnsCount(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleObserver = useCallback((entries) => {
    const target = entries[0]
    if (target.isIntersecting && visibleCount < allPhotos.length) {
      setTimeout(() => {
        setVisibleCount((prev) => Math.min(prev + PHOTOS_PER_PAGE, allPhotos.length))
      }, 300)
    }
  }, [visibleCount, allPhotos.length])

  useEffect(() => {
    const option = { root: null, rootMargin: '20px', threshold: 0 }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => { if (loaderRef.current) observer.unobserve(loaderRef.current) }
  }, [handleObserver])

  const openFullscreen = (photoUrl) => {
    setSelectedPhoto(photoUrl)
    document.body.style.overflow = 'hidden'
  }

  const closeFullscreen = () => {
    setSelectedPhoto(null)
    document.body.style.overflow = 'unset'
  }

  const visiblePhotos = allPhotos.slice(0, visibleCount)
  const columns = Array.from({ length: columnsCount }, () => [])
  visiblePhotos.forEach((photo, index) => {
    columns[index % columnsCount].push({ ...photo, originalIndex: index })
  })

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader-dots"><span></span><span></span><span></span></div>
      </div>
    )
  }

  // Find banner and profile photos
  const bannerPhoto = allPhotos.find(p => p.name.toLowerCase().includes('banner'))?.url 
    || 'https://via.placeholder.com/1200x300?text=Banner+Not+Found'
  const profilePhoto = allPhotos.find(p => p.name.toLowerCase().includes('profile'))?.url 
    || 'https://via.placeholder.com/150?text=Avatar'

  // Filter out banner and profile from the main gallery stream
  const galleryPhotos = allPhotos.filter(p => 
    !p.name.toLowerCase().includes('banner') && 
    !p.name.toLowerCase().includes('profile')
  )

  // Re-calculate columns for gallery only
  const visibleGalleryPhotos = galleryPhotos.slice(0, visibleCount)
  const galleryColumns = Array.from({ length: columnsCount }, () => [])
  visibleGalleryPhotos.forEach((photo, index) => {
    galleryColumns[index % columnsCount].push({ ...photo, originalIndex: index })
  })

  return (
    <div className="app-container">
      <header className="banner-section">
        <img src={bannerPhoto} alt="Banner" className="banner-image" />
        <div className="profile-container">
          <img src={profilePhoto} alt="Tolga Doğan" className="profile-photo" />
          <h1 className="user-name">Tolga Doğan</h1>
        </div>
      </header>

      <main className="photo-stream-grid">
        {galleryColumns.map((column, colIndex) => (
          <div key={colIndex} className="photo-column">
            {column.map((photo) => (
              <div
                key={photo.originalIndex}
                className="photo-item"
                style={{ animationDelay: `${(photo.originalIndex % PHOTOS_PER_PAGE) * 0.1}s` }}
                onClick={() => openFullscreen(photo.url)}
              >
                <img src={photo.url} alt={photo.name} loading="lazy" />
              </div>
            ))}
          </div>
        ))}
      </main>

      <div ref={loaderRef} className="scroll-sentinel">
        {visibleCount < galleryPhotos.length && (
          <div className="loader-dots"><span></span><span></span><span></span></div>
        )}
      </div>

      {selectedPhoto && (
        <div className="fullscreen-overlay" onClick={closeFullscreen}>
          <button className="close-button" onClick={closeFullscreen}>×</button>
          <img src={selectedPhoto} alt="Fullscreen" className="fullscreen-image" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default App
