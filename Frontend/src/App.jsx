import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ref, listAll, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const PHOTOS_PER_PAGE = 6
const IS_DEV = import.meta.env.DEV

// --- ÖZEL SIRALAMA LİSTESİ ---
const PHOTO_ORDER = [
  'samplePhoto44.jpg', 'samplePhoto68.jpg', 'samplePhoto76.jpg', 'samplePhoto81.jpg',
  'samplePhoto72.jpg', 'samplePhoto80.jpg', 'samplePhoto78.jpg', 'samplePhoto17.jpg',
  'samplePhoto3.jpg', 'samplePhoto52.jpg', 'samplePhoto43.jpg', 'samplePhoto11.jpg',
  'samplePhoto7.jpg', 'samplePhoto59.jpg', 'samplePhoto48.jpg', 'samplePhoto51.jpg',
  'samplePhoto57.jpg', 'samplePhoto41.jpg', 'samplePhoto37.jpg', 'samplePhoto38.jpg',
  'samplePhoto36.jpg', 'samplePhoto33.jpg', 'samplePhoto31.jpg', 'samplePhoto32.jpg',
  'samplePhoto28.jpg', 'samplePhoto24.jpg', 'samplePhoto21.jpg', 'samplePhoto1.jpg',
  'samplePhoto2.jpg', 'samplePhoto4.jpg', 'samplePhoto5.jpg', 'samplePhoto6.jpg',
  'samplePhoto8.jpg', 'samplePhoto9.jpg', 'samplePhoto10.jpg', 'samplePhoto12.jpg',
  'samplePhoto13.jpg', 'samplePhoto14.jpg', 'samplePhoto15.jpg', 'samplePhoto16.jpg',
  'samplePhoto18.jpg', 'samplePhoto19.jpg', 'samplePhoto20.jpg', 'samplePhoto22.jpg',
  'samplePhoto23.jpg', 'samplePhoto25.jpg', 'samplePhoto26.jpg', 'samplePhoto27.jpg',
  'samplePhoto29.jpg', 'samplePhoto30.jpg', 'samplePhoto34.jpg', 'samplePhoto35.jpg',
  'samplePhoto39.jpg', 'samplePhoto40.jpg', 'samplePhoto42.jpg', 'samplePhoto45.jpg',
  'samplePhoto46.jpg', 'samplePhoto47.jpg', 'samplePhoto48.jpg', 'samplePhoto49.jpg',
  'samplePhoto50.jpg', 'samplePhoto53.jpg', 'samplePhoto54.jpg', 'samplePhoto55.jpg',
  'samplePhoto56.jpg', 'samplePhoto58.jpg', 'samplePhoto60.jpg', 'samplePhoto61.jpg',
  'samplePhoto62.jpg', 'samplePhoto63.jpg', 'samplePhoto64.jpg', 'samplePhoto65.jpg',
  'samplePhoto66.jpg', 'samplePhoto67.jpg', 'samplePhoto69.jpg', 'samplePhoto70.jpg',
  'samplePhoto71.jpg', 'samplePhoto73.jpg', 'samplePhoto74.jpg', 'samplePhoto75.jpg',
  'samplePhoto77.jpg', 'samplePhoto79.jpg', 'banner.jpg', 'profilePhoto.jpg'
]

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
        const localPhotos = PHOTO_ORDER.map(name => ({
          name,
          url: `/dev_photos/${name}`
        }))
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
          
          // --- ÖZEL SIRALAMA MANTIĞI ---
          photoData.sort((a, b) => {
            const indexA = PHOTO_ORDER.indexOf(a.name)
            const indexB = PHOTO_ORDER.indexOf(b.name)
            
            // Eğer listede yoksa en sona at
            if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name)
            if (indexA === -1) return 1
            if (indexB === -1) return -1
            
            return indexA - indexB
          })
          
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
