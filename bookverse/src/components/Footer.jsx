// src/components/Footer.jsx

import React from 'react';
// Importamos solo los íconos que usa el Footer
import { BookOpen, Home, Info, BookA, Phone, Mail, FileText } from 'lucide-react';

const Footer = () => (
    <footer className="bg-gray-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 border-b border-gray-700 pb-8 mb-8">
                <div>
                    <h4 className="text-xl font-bold mb-4 flex items-center">
                        <BookOpen className="w-6 h-6 mr-2 text-indigo-400" /> BookVerse
                    </h4>
                    <p className="text-sm text-gray-400">Tu universo de reseñas literarias.</p>
                </div>
                <div>
                    <h5 className="font-semibold text-lg mb-4">Explorar</h5>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#inicio" className="text-gray-400 hover:text-indigo-400 flex items-center"><Home className="w-4 h-4 mr-2" /> Inicio</a></li>
                        <li><a href="#quiénes-somos" className="text-gray-400 hover:text-indigo-400 flex items-center"><Info className="w-4 h-4 mr-2" /> Quiénes somos</a></li>
                        <li><a href="#reseñas" className="text-gray-400 hover:text-indigo-400 flex items-center"><BookA className="w-4 h-4 mr-2" /> Reseñas</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-semibold text-lg mb-4">Legal</h5>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#" className="text-gray-400 hover:text-indigo-400 flex items-center"><FileText className="w-4 h-4 mr-2" /> Términos y Condiciones</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-indigo-400 flex items-center"><FileText className="w-4 h-4 mr-2" /> Política de Privacidad</a></li>
                    </ul>
                </div>
                <div>
                    <h5 className="font-semibold text-lg mb-4">Contacto</h5>
                    <ul className="space-y-2 text-sm">
                        <li><a href="mailto:contacto@bookverse.com" className="text-gray-400 hover:text-indigo-400 flex items-center"><Mail className="w-4 h-4 mr-2" /> contacto@bookverse.com</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-indigo-400 flex items-center"><Phone className="w-4 h-4 mr-2" /> (+1) 555-BOOK</a></li>
                    </ul>
                </div>
            </div>
            <div className="text-center text-sm text-gray-500 pt-4">
                &copy; {new Date().getFullYear()} BookVerse. Todos los derechos reservados.
            </div>
        </div>
    </footer>
);

export default Footer;