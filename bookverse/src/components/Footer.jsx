import React from 'react';
import { BookOpen, Home, Info, BookA, Mail, BookText, Github, Instagram, Twitter } from 'lucide-react';

const Footer = () => (
  <footer className="bg-[#1a1a1a] text-stone-300 py-16 border-t border-stone-800">
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-stone-800 pb-12 mb-8">
        
        {/* Brand & Mission */}
        <div className="md:col-span-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-amber-700 p-2 rounded-lg">
              <BookText className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-serif font-black text-white tracking-tight">
              MyBookCompass
            </span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed max-w-sm font-serif italic">
            "Guiando a los lectores a través del vasto océano de historias. Porque cada libro merece ser descubierto por los ojos correctos."
          </p>
          <div className="flex space-x-4 mt-6">
            
          </div>
        </div>

        {/* Explorar */}
        <div>
          <h5 className="font-serif font-bold text-white text-lg mb-6 tracking-wide">Navegación</h5>
          <ul className="space-y-4 text-sm">
            <li>
              <a href="#inicio" className="hover:text-amber-500 flex items-center transition-colors">
                <Home className="w-4 h-4 mr-3 text-amber-700" />
                Inicio
              </a>
            </li>
            <li>
              <a href="#quienes-somos" className="hover:text-amber-500 flex items-center transition-colors">
                <Info className="w-4 h-4 mr-3 text-amber-700" />
                Quiénes somos
              </a>
            </li>
            <li>
              <a href="#reseñas" className="hover:text-amber-500 flex items-center transition-colors">
                <BookA className="w-4 h-4 mr-3 text-amber-700" />
                Reseñas Literarias
              </a>
            </li>
          </ul>
        </div>

        {/* Contacto */}
        <div>
          <h5 className="font-serif font-bold text-white text-lg mb-6 tracking-wide">Contacto</h5>
          <ul className="space-y-4 text-sm">
            <li>
              <a href="mailto:contacto@MyBookCompass.com" className="hover:text-amber-500 flex items-center transition-colors">
                <Mail className="w-4 h-4 mr-3 text-amber-700" />
                hola@mybookcompass.com
              </a>
            </li>
            <li className="flex items-start text-stone-400">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-900 bg-amber-100/10 px-2 py-1 rounded">
                
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* Footer bottom */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-stone-500 uppercase tracking-[0.2em] font-bold">
        <div>
          &copy; {new Date().getFullYear()} MyBookCompass. Proyecto Modular.
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Términos</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;