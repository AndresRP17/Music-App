import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './AlbumDetails.css';

function AlbumDetail() {
  const { albumName, artistName } = useParams();
  const [albumInfo, setAlbumInfo] = useState(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=aa182e9e95ab101a5f7ae68eba441e09&artist=${encodeURIComponent(artistName)}&album=${encodeURIComponent(albumName)}&format=json`
        );
        const data = await response.json();
        setAlbumInfo(data.album);
      } catch (error) {
        console.error("Error al traer el detalle:", error);
      }
    };
    fetchAlbumDetails();
  }, [albumName, artistName]);


  if (!albumInfo) return <div className="loading">Cargando...</div>;

  return (
    <div className="album-detail-container">
      

      <header className="album-header">
        <img 
          src={albumInfo.image[3]['#text'] || 'https://via.placeholder.com/300'} 
          alt={albumInfo.name} 
          className="detail-cover"
        />
        <div className="header-info">
          <p className="type">Álbum</p>
          <h1>{albumInfo.name}</h1>
          <div className="album-metadata">
            <span className="artist-name-main">{albumInfo.artist}</span>
            {albumInfo.tags?.tag?.length > 0 && (
              <span className="genre-tag"> • {albumInfo.tags.tag[0].name}</span>
            )}
            <span className="extra-info"> • {albumInfo.tracks?.track.length} canciones</span>
          </div>
        </div>
      </header>

      <div className="detail-layout">
        <section className="tracklist-section">
          <div className="tracklist-header">
            <span>#</span>
            <span>Título</span>
            <span>
              </span> {/* Espacio para el botón play */}
            <span className="text-right">Duración</span>
          </div>
          <hr />
          <div className="tracklist">
            {albumInfo.tracks?.track.map((track, index) => (
              <div key={index} className="track-row">
               
                <span className="track-number">{index + 1}</span>
                
                <span className="track-name">{track.name}</span>
                
                

                <span className="track-duration">
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  
                </span>
  
              </div>
            ))}
          </div>
        </section>

        <aside className="album-sidebar">
          {albumInfo.wiki ? (
            <div className="wiki-card">
              <h3>Sobre el álbum</h3>
              <p className="wiki-text">
                {albumInfo.wiki.summary.split('<a href')[0]}
              </p>
              
            </div>
          ) : (
            <div className="wiki-card">
              <p className="no-wiki">No hay descripción disponible.</p>
            </div>
          )}
        </aside>
      </div>

    </div>
  );
}

export default AlbumDetail;