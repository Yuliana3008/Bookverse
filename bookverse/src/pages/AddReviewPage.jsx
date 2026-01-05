import React, { useState } from 'react';
import { Edit3, Star, BookOpen, User, ImageIcon } from 'lucide-react'; 
import { useOutletContext } from 'react-router-dom';
import API_URL from '../config';

const AddReviewPage = () => {
    // I. OBTENER CONTEXTO DEL LAYOUT
    const { isAuthenticated, userId, setAuthMessage, openModal } = useOutletContext();

    // II. ESTADO DEL FORMULARIO
    const [bookTitle, setBookTitle] = useState('');
    const [author, setAuthor] = useState(''); // Nuevo: Estado para el Autor
    const [rating, setRating] = useState(0); 
    const [reviewText, setReviewText] = useState('');
    const [imageFile, setImageFile] = useState(null); // Nuevo: Archivo binario
    const [previewUrl, setPreviewUrl] = useState(null); // Nuevo: Para la vista previa
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Manejar la selección del archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Crea URL temporal para la vista previa
        }
    };

    // III. MANEJO DEL ENVÍO
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAuthenticated) {
            setAuthMessage({ type: 'error', text: 'Debes iniciar sesión para publicar una reseña.' });
            openModal('login');
            return;
        }

        if (rating === 0 || reviewText.length < 10 || bookTitle.length < 3 || author.length < 2) {
            setAuthMessage({ type: 'error', text: 'Por favor, completa todos los campos y escribe al menos 10 caracteres.' });
            return;
        }

        setIsSubmitting(true);

        // USAMOS FORMDATA PARA ENVIAR EL ARCHIVO FÍSICO Y LOS TEXTOS
        const formData = new FormData();
        formData.append('usuarios_id', userId);
        formData.append('book_title', bookTitle);
        formData.append('book_id', bookTitle.toLowerCase().replace(/\s/g, '_'));
        formData.append('author', author);
        formData.append('rating', rating);
        formData.append('review_text', reviewText);
        if (imageFile) {
            formData.append('image', imageFile); // 'image' debe coincidir con upload.single('image') en el backend
        }

        try {
            const response = await fetch(`${API_URL}/api/reviews`, { 
                method: 'POST',
                // IMPORTANTE: NO incluir 'Content-Type', el navegador lo pone automáticamente con FormData
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Falló la publicación de la reseña');
            }

            setAuthMessage({ type: 'success', text: `¡Reseña de "${bookTitle}" publicada con éxito!` });
            
            // Limpiar formulario
            setBookTitle('');
            setAuthor('');
            setRating(0);
            setReviewText('');
            setImageFile(null);
            setPreviewUrl(null);

        } catch (error) {
            setAuthMessage({ type: 'error', text: error.message || 'Error al conectar con el servidor.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // IV. VERIFICACIÓN DE AUTENTICACIÓN
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center py-24 min-h-screen text-center bg-[#e9e4d5]">
                <div className="bg-[#f4f1ea] p-10 shadow-2xl border border-stone-300 max-w-md">
                    <Edit3 className="w-16 h-16 text-amber-900 mb-6 mx-auto opacity-50" />
                    <h2 className="text-3xl font-serif font-black text-stone-900 mb-4 italic">Acceso Restringido</h2>
                    <p className="text-stone-700 font-serif mb-8 text-lg italic">Necesitas iniciar sesión para poder escribir una reseña.</p>
                    <button 
                        onClick={() => openModal('login')} 
                        className="bg-amber-900 text-[#f4f1ea] px-10 py-4 font-serif italic text-xl shadow-lg hover:bg-black transition-all"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }
    
    // V. RENDERIZADO DE ESTRELLAS
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((starValue) => (
            <Star
                key={starValue}
                fill={starValue <= rating ? '#78350f' : 'none'} 
                stroke={starValue <= rating ? '#78350f' : '#78716c'} 
                className="w-10 h-10 cursor-pointer transition-transform duration-200 hover:scale-110"
                onClick={() => setRating(starValue)}
            />
        ));
    };

    return (
        <section id="nueva-reseña" className="py-24 bg-[#e9e4d5] min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif font-black text-stone-900 flex items-center justify-center italic">
                        <Edit3 className="w-9 h-9 mr-4 text-amber-800 opacity-80"/> 
                        Escribe una Nueva Reseña
                    </h2>
                    <div className="h-1 w-24 bg-amber-800 mx-auto mt-6 shadow-sm"></div>
                </div>

                <div className="bg-[#f4f1ea] p-10 shadow-2xl border border-stone-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-stone-300 border-r border-stone-400"></div>

                    <form onSubmit={handleSubmit} className="pl-4">
                        {/* Título del Libro */}
                        <div className="mb-8">
                            <label htmlFor="bookTitle" className="block text-stone-900 font-serif font-bold text-lg mb-3 flex items-center italic">
                                <BookOpen className="w-5 h-5 mr-3 text-amber-900" /> Título del Libro:
                            </label>
                            <input
                                id="bookTitle"
                                type="text"
                                value={bookTitle}
                                onChange={(e) => setBookTitle(e.target.value)}
                                required
                                className="w-full p-4 bg-transparent border-b-2 border-stone-300 focus:border-amber-800 outline-none text-xl font-serif italic text-stone-800 placeholder-stone-400"
                                placeholder="Ej: Cien años de soledad"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Autor del Libro */}
                        <div className="mb-8">
                            <label htmlFor="author" className="block text-stone-900 font-serif font-bold text-lg mb-3 flex items-center italic">
                                <User className="w-5 h-5 mr-3 text-amber-900" /> Autor:
                            </label>
                            <input
                                id="author"
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                                className="w-full p-4 bg-transparent border-b-2 border-stone-300 focus:border-amber-800 outline-none text-xl font-serif italic text-stone-800 placeholder-stone-400"
                                placeholder="Ej: Gabriel García Márquez"
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Portada del Libro (Botón estilizado) */}
                        <div className="mb-8">
                            <label className="block text-stone-900 font-serif font-bold text-lg mb-3 flex items-center italic">
                                <ImageIcon className="w-5 h-5 mr-3 text-amber-900" /> Portada del Libro:
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="cursor-pointer bg-[#ede9dd] border border-stone-300 px-6 py-3 font-serif italic text-stone-700 hover:bg-stone-200 transition-all shadow-sm">
                                    {imageFile ? "Cambiar Imagen" : "Seleccionar Archivo"}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </label>
                                {imageFile && <span className="text-stone-500 italic text-sm truncate max-w-[200px]">{imageFile.name}</span>}
                            </div>
                            
                            {/* Vista previa con estilo de foto física */}
                            {previewUrl && (
                                <div className="mt-6 flex justify-center md:justify-start">
                                    <img src={previewUrl} alt="Vista previa" className="h-44 shadow-lg border-4 border-white p-1 bg-white" />
                                </div>
                            )}
                        </div>
                        
                        <div className="mb-10 text-center md:text-left">
                            <label className="block text-stone-900 font-serif font-bold text-lg mb-4 italic">Puntuación:</label>
                            <div className="flex space-x-2 justify-center md:justify-start">
                                {renderStars()}
                            </div>
                        </div>

                        <div className="mb-10">
                            <label htmlFor="reviewText" className="block text-stone-900 font-serif font-bold text-lg mb-3 italic">Tu Reseña:</label>
                            <textarea
                                id="reviewText"
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                rows="8"
                                required
                                className="w-full p-6 bg-[#ede9dd]/50 border border-stone-300 focus:border-amber-800 outline-none font-serif text-lg italic text-stone-800 leading-relaxed resize-y placeholder-stone-400"
                                placeholder="Comparte tu opinión..."
                                disabled={isSubmitting}
                            ></textarea>
                            <p className="text-xs text-stone-500 font-sans tracking-widest uppercase mt-3 italic">Mínimo 10 caracteres.</p>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-5 text-xl font-serif italic transition shadow-xl border border-amber-950 ${
                                isSubmitting 
                                    ? 'bg-stone-400 cursor-not-allowed text-stone-200' 
                                    : 'bg-amber-900 text-[#f4f1ea] hover:bg-black active:translate-y-1'
                            }`}
                        >
                            {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default AddReviewPage;