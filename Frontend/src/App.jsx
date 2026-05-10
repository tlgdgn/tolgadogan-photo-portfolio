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
          { name: 'samplePhoto1.jpg', url: '/dev_photos/samplePhoto1.jpg' },
          { name: 'samplePhoto2.jpg', url: '/dev_photos/samplePhoto2.jpg' },
          { name: 'samplePhoto3.jpg', url: '/dev_photos/samplePhoto3.jpg' },
          { name: 'samplePhoto4.jpg', url: '/dev_photos/samplePhoto4.jpg' },
          { name: 'samplePhoto5.jpg', url: '/dev_photos/samplePhoto5.jpg' },
          { name: 'samplePhoto6.jpg', url: '/dev_photos/samplePhoto6.jpg' },
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
